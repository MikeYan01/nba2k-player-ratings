import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

import { BASE_URL } from "./url.js";
import { CURRENT_TEAMS } from "./teams.js";
import { player } from "./player.js";
import { teamNamePrettier } from "./util.js";
import { parse } from "json2csv"


/**
 * Get each team's URL.
 */
function getTeamsUrl(team) {
  let baseUrl = BASE_URL;
  return `${baseUrl}/teams/${team}`;
}

/**
 * Get all player urls in one team.
 */
async function getPlayersUrlsFromEachTeam(team) {
  let playerUrls = [];
  let teamUrl = getTeamsUrl(team);

  const options = {
    headers: {
      "User-Agent": "request",
    },
  };

  try {
    const response = await axios.get(teamUrl, options);
    let tbody = cheerio.load(response.data)("tbody");
    let table = tbody[0];
    let entries = cheerio.load(table)(".entry-font");

    for (let entry of entries) {
      let playerUrl = cheerio.load(entry)("a").attr("href");
      playerUrls.push(playerUrl);
    }

    if (playerUrls.length > 0) {
      return playerUrls;
    } else {
      throw new Error("Empty playerUrls length");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get player detail response.");
  }
}

/**
 * Get each player's attribute details.
 */
async function getPlayerDetail(team, playerUrl) {
  const options = {
    headers: {
      "User-Agent": "request",
    },
  };

  try {
    const response = await axios.get(playerUrl, options);
    var p = new player();

    // name
    let nameDiv = cheerio.load(response.data)("h1");
    p.name = nameDiv.text().trim();

    // overall attribute
    let overallAttribute = cheerio.load(response.data)(".attribute-box-player");
    p.overallAttribute = parseInt(overallAttribute.text().trim());

    // team
    p.team = team;

    let attributes = cheerio.load(response.data)(
      ".content .card .card-body .list-no-bullet li .attribute-box"
    );

    // outside scoring
    let closeShot = attributes[0].children[0].data.trim();
    p.closeShot = parseInt(closeShot);
    let midRangeShot = attributes[1].children[0].data.trim();
    p.midRangeShot = parseInt(midRangeShot);
    let threePointShot = attributes[2].children[0].data.trim();
    p.threePointShot = parseInt(threePointShot);
    let freeThrow = attributes[3].children[0].data.trim();
    p.freeThrow = parseInt(freeThrow);
    let shotIQ = attributes[4].children[0].data.trim();
    p.shotIQ = parseInt(shotIQ);
    let offensiveConsistency = attributes[5].children[0].data.trim();
    p.offensiveConsistency = parseInt(offensiveConsistency);

    // badges
    const badgeRawData = cheerio.load(response.data)('.badge-count')
    let legendaryBadgeCount = badgeRawData[0].children[0].data
    p.legendaryBadgeCount = parseInt(legendaryBadgeCount)
    let purpleBadgeCount = badgeRawData[1].children[0].data
    p.purpleBadgeCount = parseInt(purpleBadgeCount)
    let goldBadgeCount = badgeRawData[2].children[0].data
    p.goldBadgeCount = parseInt(goldBadgeCount)
    let silverBadgeCount = badgeRawData[3].children[0].data
    p.silverBadgeCount = parseInt(silverBadgeCount)
    let bronzeBadgeCount = badgeRawData[4].children[0].data
    p.bronzeBadgeCount = parseInt(bronzeBadgeCount)
    let badgeCount = badgeRawData[5].children[0].data
    p.badgeCount = parseInt(badgeCount)

    const rawOutsideScoringCount = cheerio.load(response.data)('#pills-outscoring-tab').text();
    let digitMatch = rawOutsideScoringCount.match(/\((\d+)\)/);
    const outsideScoringCount = digitMatch ? parseInt(digitMatch[1], 10) : null;
    p.outsideScoringBadgeCount = outsideScoringCount

    const rawInsideScoringCount = cheerio.load(response.data)('#pills-inscoring-tab').text();
    digitMatch = rawInsideScoringCount.match(/\((\d+)\)/);
    const insideScoringCount = digitMatch ? parseInt(digitMatch[1], 10) : null;
    p.insideScoringBadgeCount= insideScoringCount

    const rawPlaymakingCount = cheerio.load(response.data)('#pills-playmaking-tab').text();
    digitMatch = rawPlaymakingCount.match(/\((\d+)\)/);
    const playmakingCount = digitMatch ? parseInt(digitMatch[1], 10) : null;
    p.insideScoringBadgeCount= playmakingCount

    const rawDefenseCount = cheerio.load(response.data)('#pills-defense-tab').text();
    digitMatch = rawDefenseCount.match(/\((\d+)\)/);
    const defenseCount = digitMatch ? parseInt(digitMatch[1], 10) : null;
    p.defensiveBadgeCount = defenseCount

    const rawReboundingCount = cheerio.load(response.data)('#pills-rebounding-tab').text();
    digitMatch = rawReboundingCount.match(/\((\d+)\)/);
    const reboundingCount = digitMatch ? parseInt(digitMatch[1], 10) : null;
    p.reboundingBadgeCount = reboundingCount

    const rawGeneralOffenseCount = cheerio.load(response.data)('#pills-genoffense-tab').text();
    digitMatch = rawGeneralOffenseCount.match(/\((\d+)\)/);
    const generalOffenseCount = digitMatch ? parseInt(digitMatch[1], 10) : null;
    p.generalOffenseBadgeCount = generalOffenseCount

    const rawAllAroundCount = cheerio.load(response.data)('#pills-allaround-tab').text();
    digitMatch = rawAllAroundCount.match(/\((\d+)\)/);
    const allAroundCount = digitMatch ? parseInt(digitMatch[1], 10) : null;
    p.allAroundBadgeCount = allAroundCount

    // height + position
    let generalStatParent = cheerio.load(response.data)('.header-subtitle')
    let heightStr = generalStatParent[0].children[6].children[1].children[0].data
    p.height = heightStr
    
    let position = (generalStatParent[0].children[4].children[1].children[0].data)
    p.position = position

    // athleticism
    let speed = attributes[6].children[0].data.trim();
    p.speed = parseInt(speed);
    let agility = attributes[7].children[0].data.trim();
    p.agility = parseInt(agility);
    let strength = attributes[8].children[0].data.trim();
    p.strength = parseInt(strength);
    let vertical = attributes[9].children[0].data.trim();
    p.vertical = parseInt(vertical);
    let stamina = attributes[10].children[0].data.trim();
    p.stamina = parseInt(stamina);
    let hustle = attributes[11].children[0].data.trim();
    p.hustle = parseInt(hustle);
    let overallDurability = attributes[12].children[0].data.trim();
    p.overallDurability = parseInt(overallDurability);

    // inside scoring
    let layup = attributes[13].children[0].data.trim();
    p.layup = parseInt(layup);
    let standingDunk = attributes[14].children[0].data.trim();
    p.standingDunk = parseInt(standingDunk);
    let drivingDunk = attributes[15].children[0].data.trim();
    p.drivingDunk = parseInt(drivingDunk);
    let postHook = attributes[16].children[0].data.trim();
    p.postHook = parseInt(postHook);
    let postFade = attributes[17].children[0].data.trim();
    p.postFade = parseInt(postFade);
    let postControl = attributes[18].children[0].data.trim();
    p.postControl = parseInt(postControl);
    let drawFoul = attributes[19].children[0].data.trim();
    p.drawFoul = parseInt(drawFoul);
    let hands = attributes[20].children[0].data.trim();
    p.hands = parseInt(hands);

    // playmaking
    let passAccuracy = attributes[21].children[0].data.trim();
    p.passAccuracy = parseInt(passAccuracy);
    let ballHandle = attributes[22].children[0].data.trim();
    p.ballHandle = parseInt(ballHandle);
    let speedWithBall = attributes[23].children[0].data.trim();
    p.speedWithBall = parseInt(speedWithBall);
    let passIQ = attributes[24].children[0].data.trim();
    p.passIQ = parseInt(passIQ);
    let passVision = attributes[25].children[0].data.trim();
    p.passVision = parseInt(passVision);

    // defense
    let interiorDefense = attributes[26].children[0].data.trim();
    p.interiorDefense = parseInt(interiorDefense);
    let perimeterDefense = attributes[27].children[0].data.trim();
    p.perimeterDefense = parseInt(perimeterDefense);
    let steal = attributes[28].children[0].data.trim();
    p.steal = parseInt(steal);
    let block = attributes[29].children[0].data.trim();
    p.block = parseInt(block);
    let helpDefenseIQ = attributes[30].children[0].data.trim();
    p.helpDefenseIQ = parseInt(helpDefenseIQ);
    let passPerception = attributes[31].children[0].data.trim();
    p.passPerception = parseInt(passPerception);
    let defensiveConsistency = attributes[32].children[0].data.trim();
    p.defensiveConsistency = parseInt(defensiveConsistency);

    // rebounding
    let offensiveRebound = attributes[33].children[0].data.trim();
    p.offensiveRebound = parseInt(offensiveRebound);
    let defensiveRebound = attributes[34].children[0].data.trim();
    p.defensiveRebound = parseInt(defensiveRebound);

    return p;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get player details");
  }
}

/**
 * Player sorting comparator to group by each team, then sort all players by overall attributes from highest to lowest among the team
 */
function sortPlayersWithTeamGroupBy(a, b) {
  return a.team === b.team
    ? b.overallAttribute - a.overallAttribute
    : a.team < b.team;
}

/**
 * Player sorting comparator to sort all players by overall attributes from highest to lowest among the whole league.
 */
function sortPlayersWithoutTeamGroupBy(a, b) {
  return b.overallAttribute - a.overallAttribute;
}

/**
 * Sava data to local disk. Every new run generates a new file.
 */
function saveData(db) {
  const today = new Date();
  const csvData = parse(db);
  let filePath = `./data/2kroster_${today.toDateString()}.csv`;
  // let data = JSON.stringify(db, null, 4);
  
  fs.writeFile(filePath, csvData, error => {
      if (error == null) {
          console.log("Successfully saved the latest rosters.");
      } else {
          console.log('Failed to save player roster to disk.', error);
      }
  })
}

const main = async function () {
  let teams = CURRENT_TEAMS;

  // <teams, all player urls>
  var roster = new Map();

  // all players details
  var players = [];

  console.log("################ Fetching player urls ... ################");
  await Promise.all(
    teams.map(async (team) => {
      let playerUrls = await getPlayersUrlsFromEachTeam(team);
      roster.set(team, playerUrls);
    })
  );

  console.log("################ Fetching player details ... ################");
  for (let team of teams) {
    let playerUrls = roster.get(team);
    let prettiedTeamName = teamNamePrettier(team);

    console.log(`---------- ${prettiedTeamName} ----------`);

    await Promise.all(
      playerUrls.map(async (playerUrl) => {
        let player = await getPlayerDetail(prettiedTeamName, playerUrl);
        players.push(player);
        console.log(`Successfully fetched ${player.name}'s detail.`);
      })
    );
  }

  let teamResult = [...players].sort(sortPlayersWithTeamGroupBy);
  let leagueResult = players.sort(sortPlayersWithoutTeamGroupBy);

  console.log("################ Saving data to disk ... ################");
  saveData(teamResult);
  saveData(leagueResult);
};

main();
