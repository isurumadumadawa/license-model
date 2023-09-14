const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");

const data = require("./random_objects_with_change.json");

// Function to normalize data
function normalizeData(data) {
  const min = tf.min(data, 0);
  const max = tf.max(data, 0);
  const normalizedData = data.sub(min).div(max.sub(min));
  return { data: normalizedData, min, max };
}

// Data Preparation
const features = tf.tensor2d(
  data.map((d) => [
    d.penaltySum,
    d.vehicleTypeSum,
    d.fromLast,
    d.policeAreaSum,
    d.ruleSum,
  ])
);
const labels = tf.tensor1d(data.map((d) => d.change));

const {
  data: normalizedFeatures,
  min: inputMin,
  max: inputMax,
} = normalizeData(features);
const {
  data: normalizedLabels,
  min: labelMin,
  max: labelMax,
} = normalizeData(labels);

// Split Data into Training and Testing Sets
const splitRatio = 0.8;
const numExamples = features.shape[0];
const numTrainExamples = Math.floor(numExamples * splitRatio);

const trainFeatures = normalizedFeatures.slice(
  [0, 0],
  [numTrainExamples, features.shape[1]]
);
const trainLabels = normalizedLabels.slice([0], [numTrainExamples]);
const testFeatures = normalizedFeatures.slice(
  [numTrainExamples, 0],
  [numExamples - numTrainExamples, features.shape[1]]
);
const testLabels = normalizedLabels.slice(
  [numTrainExamples],
  [numExamples - numTrainExamples]
);

// Create and Train the Model
function createModel() {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({ units: 32, activation: "relu", inputShape: [5] })
  );
  model.add(tf.layers.dense({ units: 16, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({ optimizer: "adam", loss: "meanSquaredError" });
  return model;
}

const model = createModel();

const scriptDirectory = path.dirname(require.main.filename);
const modelFileName = "model"; // Specify the model filename without the path
const modelSavePath = path.join(scriptDirectory, modelFileName);
const metadataFileName = "metadata.json"; // Specify the metadata filename
const metadataSavePath = path.join(modelSavePath, metadataFileName);

model
  .fit(trainFeatures, trainLabels, { epochs: 50 })
  .then((history) => {
    console.log("Model training completed.");

    // Serialize tensor values in metadata
    const metadata = {
      inputMin: inputMin.arraySync(),
      inputMax: inputMax.arraySync(),
      labelMin: labelMin.arraySync(),
      labelMax: labelMax.arraySync(),
    };

    // Save the entire model and metadata
    return Promise.all([
      model.save(`file://${modelSavePath}`),
      fs.promises.writeFile(
        metadataSavePath,
        JSON.stringify(metadata, null, 2)
      ),
    ]);
  })
  .then(() => {
    console.log("Model and metadata saved successfully.");
  })
  .catch((err) => {
    console.error("Error training and saving the model:", err);
  });
