



# Train 3-class emotion model using MobileNetV2
# Classes: happy, neutral, sad

import json
from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks, regularizers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# ---------------- CONFIG ----------------
IMG_SIZE = (224, 224)
BATCH_SIZE = 32

# Phase 1 (freeze) epochs
FREEZE_EPOCHS = 20

# Phase 2 (fine-tune) epochs
EPOCHS = 150  # <-- This is Phase 2 epochs

VAL_SPLIT = 0.1
SEED = 42
LR = 1e-3
WEIGHT_DECAY = 2e-5

FACES_DIR = r"C:\Users\predator\Desktop\demo_gg\image\faces"   # happy/neutral/sad inside this folder
MODEL_PATH = Path("models/emotion_cnn.keras")
LABELS_PATH = Path("models/emotion_cnn.labels.json")

# ---------------------------------------


def load_datasets():
    train_ds = tf.keras.utils.image_dataset_from_directory(
        FACES_DIR,
        validation_split=VAL_SPLIT,
        subset="training",
        seed=SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
        color_mode="rgb",
        shuffle=True,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        FACES_DIR,
        validation_split=VAL_SPLIT,
        subset="validation",
        seed=SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
        color_mode="rgb",
        shuffle=False,
    )

    class_names = train_ds.class_names
    print("✅ Detected classes (order):", class_names)

    LABELS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(LABELS_PATH, "w", encoding="utf-8") as f:
        json.dump(class_names, f, ensure_ascii=False, indent=2)
    print("✅ Labels saved to:", LABELS_PATH)

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.map(lambda x, y: (preprocess_input(x), y), num_parallel_calls=AUTOTUNE)
    val_ds = val_ds.map(lambda x, y: (preprocess_input(x), y), num_parallel_calls=AUTOTUNE)

    train_ds = train_ds.prefetch(AUTOTUNE)
    val_ds = val_ds.prefetch(AUTOTUNE)

    return train_ds, val_ds, class_names


def compute_class_weights(ds, num_classes: int):
    counts = np.zeros(num_classes, dtype=np.float64)
    for _, y in ds.unbatch():
        idx = int(np.argmax(y.numpy()))
        counts[idx] += 1

    total = counts.sum()
    weights = {}
    for i in range(num_classes):
        if counts[i] == 0:
            weights[i] = 1.0
        else:
            weights[i] = float(total / (num_classes * counts[i]))

    print("✅ Class counts:", counts.tolist())
    print("✅ Class weights:", weights)
    return weights


def build_model(num_classes: int):
    base = MobileNetV2(
        include_top=False,
        weights="imagenet",
        input_shape=(*IMG_SIZE, 3),
    )
    base.trainable = False  # Phase 1 freeze

    inputs = layers.Input(shape=(*IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.35)(x)
    x = layers.Dense(
        192,
        activation="relu",
        kernel_regularizer=regularizers.l2(WEIGHT_DECAY),
    )(x)
    x = layers.Dropout(0.35)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs, outputs)
    return model, base


def main():
    tf.random.set_seed(SEED)

    train_ds, val_ds, labels = load_datasets()
    num_classes = len(labels)
    class_weights = compute_class_weights(train_ds, num_classes)

    model, base = build_model(num_classes)

    # Callbacks (NO EarlyStopping)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    cb = [
        callbacks.ModelCheckpoint(
            filepath=str(MODEL_PATH),
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
        callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            min_lr=1e-6,
            verbose=1,
        ),
    ]

    # ---------------- Phase 1 ----------------
    print("\n🚀 Phase 1: Training classifier head (backbone frozen)")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(LR),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=FREEZE_EPOCHS,          # ✅ will run full 15 epochs
        class_weight=class_weights,
        callbacks=cb,
        verbose=1,
    )

    # ---------------- Phase 2 ----------------
    print("\n🚀 Phase 2: Fine-tuning backbone (unfreeze last 34%)")
    # Unfreeze last ~34% layers except BatchNorm
    start_unfreeze = int(len(base.layers) * 0.66)
    for layer in base.layers[start_unfreeze:]:
        if not isinstance(layer, layers.BatchNormalization):
            layer.trainable = True

    model.compile(
        optimizer=tf.keras.optimizers.Adam(LR * 0.1),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,                # ✅ will run full 100 epochs (Phase 2)
        class_weight=class_weights,
        callbacks=cb,
        verbose=1,
    )

    # Save final model too (best already saved by checkpoint)
    model.save(MODEL_PATH)
    print("\n✅ Training complete")
    print("✅ Model saved at:", MODEL_PATH)
    print("✅ Labels saved at:", LABELS_PATH)


if __name__ == "__main__":
    main()
