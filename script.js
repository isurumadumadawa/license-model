const fs = require("fs");

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateChange(
  penaltySum,
  vehicleTypeSum,
  fromLast,
  policeAreaSum,
  ruleSum
) {
  let change = 0;
  if (penaltySum == 0) {
    change = 0;
  } else {
    change =
      penaltySum * 0.005 + vehicleTypeSum * 0.005 + policeAreaSum * 0.005;
    //if 0- 30 from 1.5 to 0 and after 0.005 for every day
    if (fromLast < 30) {
      change += (30 - fromLast) / 50;
    } else if (fromLast >= 30) {
      change += (fromLast - 30) * -0.005;
    }
    // if ruleSum  > PenaltySum% then * 1.5 else 0.01 for each
    if (ruleSum >= penaltySum / 2) {
      change += 0.1;
    } else {
      change += ruleSum * 0.01;
    }
  }

  return change;
}

function generateRandomObjects(count) {
  const objects = [];

  for (let i = 0; i < count; i++) {
    const penaltySum = getRandomInt(0, 30);
    const vehicleTypeSum = getRandomInt(0, penaltySum);
    const fromLast = getRandomInt(0, 100);
    const policeAreaSum = getRandomInt(0, penaltySum);
    const rule = getRandomInt(1, 34);
    const maxRuleSum = Math.min(penaltySum, vehicleTypeSum, policeAreaSum);
    const ruleSum = getRandomInt(0, maxRuleSum);

    const change = calculateChange(
      penaltySum,
      vehicleTypeSum,
      fromLast,
      policeAreaSum,
      ruleSum
    );
    let obj = {};
    if (penaltySum == 0) {
      obj = {
        penaltySum,
        vehicleTypeSum: 0,
        fromLast: 0,
        policeAreaSum: 0,
        //   rule,
        ruleSum: 0,
        change, // Add the "change" key with the calculated value
      };
    } else {
      obj = {
        penaltySum,
        vehicleTypeSum,
        fromLast,
        policeAreaSum,
        //   rule,
        ruleSum,
        change, // Add the "change" key with the calculated value
      };
    }

    objects.push(obj);
  }

  return objects;
}

function exportToJsonFile(objects, filename) {
  const json = JSON.stringify(objects, null, 2);
  fs.writeFileSync(filename, json);
}

const generatedObjects = generateRandomObjects(100000);
exportToJsonFile(generatedObjects, "random_objects_with_change.json");
