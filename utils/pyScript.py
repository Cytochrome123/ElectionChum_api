import numpy as np
import pandas as pd
import tensorflow as tf
import keras

# ! pip install keras_applications
# !pip install keras_vggface
# !pip install keras==2.1.6

from keras_vggface.utils import preprocess_input #To process the image into the VGG() format
from keras_vggface.vggface import VGGFace

from keras.utils import load_img, img_to_array


#dimension of images
image_width, image_height=224, 224

model=keras.models.load_model('./vgg_face.h5')
