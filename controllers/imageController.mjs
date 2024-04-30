import * as tf from "@tensorflow/tfjs";
import { createCanvas, loadImage } from "canvas";

// Load ResNet50 model with pre-trained weights from ImageNet
async function loadResNet50Model() {
  try {
    const model = await tf.keras.applications.resNet50({
      includeTop: true,
      weights: "imagenet",
      inputTensor: null,
      inputShape: null,
      pooling: null,
      classes: 1000,
      classifierActivation: "softmax",
    });
    return model;
  } catch (error) {
    console.error("Error loading ResNet50 model:", error);
    throw error;
  }
}

// Classify image using the loaded model
async function classifyImage(imagePath, model) {
  try {
    // Load and preprocess the image
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);

    // Convert canvas to tensor
    const tensor = tf.browser.fromPixels(canvas).expandDims(0).toFloat();

    // Make predictions
    if (model && model.predict) {
      const predictions = await model.predict(tensor).data();
      return predictions;
    } else {
      throw new Error("Model is not properly initialized or loaded");
    }
    return predictions;
  } catch (error) {
    console.error("Error classifying image:", error);
    throw error;
  }
}

// Controller function to handle image classification
export async function classifyImageController(req, res) {
  try {
    // Access the uploaded file via req.file
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const imagePath = req.file.path;
    console.log("Image path:", imagePath);

    // Load ResNet50 model
    const model = await loadResNet50Model();

    // Classify image to obtain predictions
    const predictions = await classifyImage(imagePath, model);

    // Send the predictions as response
    res.json({ predictions });
  } catch (error) {
    console.error("Error:", error);
    // Error occurred during classification
    res.status(500).send("Error occurred during classification");
  }
}

// Function to upload image
export async function uploadImage(req, res) {
  // Access the uploaded file via req.file
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const imagePath = req.file.path;
  console.log(imagePath);
  try {
    // Load ResNet50 model
    const model = await loadResNet50Model();

    // Classify image to obtain predictions
    const predictions = await classifyImage(imagePath, model);

    const annotations = await formatAnnotations(predictions);

    // File uploaded and annotations generated successfully
    res.json({ annotations });
  } catch (error) {
    console.error("Error:", error);
    // Error occurred during classification or annotation generation
    res.status(500).send("Error occurred during annotation generation");
  }
}

