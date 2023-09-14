const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");

// Function to load the saved model and normalization metadata
async function loadModelWithMetadata() {
  const modelSavePath = "model/model.json";
  const metadataSavePath = "model/metadata.json"; // Specify the path where the model is saved
  try {
    const scriptDirectory = path.dirname(require.main.filename);
    const metadataFilePath = path.join(scriptDirectory, metadataSavePath);

    // Load normalization metadata
    const metadataString = fs.readFileSync(metadataFilePath, "utf8");
    const metadata = JSON.parse(metadataString);

    // Load the model
    const model = await tf.loadLayersModel(
      `file://${path.join(scriptDirectory, modelSavePath)}`
    );
    console.log("Model loaded successfully.");

    return { model, metadata };
  } catch (error) {
    console.error("Error loading the model:", error);
    return null;
  }
}

// Usage example
(async () => {
  const { model, metadata } = await loadModelWithMetadata();

  if (model && metadata) {
    // Extract values from metadata object
    const inputMin = tf.tensor(metadata.inputMin);
    const inputMax = tf.tensor(metadata.inputMax);
    const labelMin = tf.tensor(metadata.labelMin);
    const labelMax = tf.tensor(metadata.labelMax);

    // Example input data (replace with your own data)
    const inputData = [
      [12, 6, 12, 6, 6], // Sample input 1   penaltySum, vehicleTypeSum, fromLast, policeAreaSum, ruleSum,
    ];

    // Normalize the input data using retrieved min-max values
    const inputTensor = tf.tensor2d(inputData);
    const normalizedInput = inputTensor
      .sub(inputMin)
      .div(inputMax.sub(inputMin));

    // Make predictions using the loaded model
    const predictions = model.predict(normalizedInput);

    // Denormalize the predictions
    const denormalizedPredictions = predictions
      .mul(labelMax.sub(labelMin))
      .add(labelMin);

    // Get the predicted change values as an array
    const predictedChanges = denormalizedPredictions.arraySync();

    console.log("Predicted Changes:", predictedChanges);
  }
})();
