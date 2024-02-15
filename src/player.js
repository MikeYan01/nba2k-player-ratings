/**
 * All player properties and attributes.
 */
export var player = function() {
    // general
    this.name = "";
    this.team = "";
    this.overallAttribute = 0;

    // outside scoring
    this.closeShot = 0;
    this.midRangeShot = 0;
    this.threePointShot = 0;
    this.freeThrow = 0;
    this.shotIQ = 0;
    this.offensiveConsistency = 0;

    // inside scoring
    this.layup = 0;
    this.standingDunk = 0;
    this.drivingDunk = 0;
    this.postHook = 0;
    this.postFade = 0;
    this.postControl = 0;
    this.drawFoul = 0;
    this.hands = 0;

    // defending
    this.interiorDefense = 0;
    this.perimeterDefense = 0;
    this.steal = 0;
    this.block = 0;
    this.lateralQuickness = 0;
    this.helpDefenseIQ = 0;
    this.passPerception = 0;
    this.defensiveConsistency = 0;

    // athleticism
    this.speed = 0;
    this.acceleration = 0;
    this.strength = 0;
    this.vertical = 0;
    this.stamina = 0;
    this.hustle = 0;
    this.overallDurability = 0;

    // playmaking
    this.passAccuracy = 0;
    this.ballHandle = 0;
    this.speedWithBall = 0;
    this.passIQ = 0;
    this.passVision = 0;

    // rebounding
    this.offensiveRebound = 0;
    this.defensiveRebound = 0;
}
