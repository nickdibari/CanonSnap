#!/usr/bin/python3
import cognitive_face as CF
import json

KEY = json.load(open("./config.txt"))
CF.Key.set(KEY["API_KEY"])

BASE_URL = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/"
CF.BaseUrl.set(BASE_URL)


def process_image_from_url(img_url):
    face_dict = CF.face.detect(img_url)
    print(json.dumps(face_dict, sort_keys=True, indent=4))

if __name__ == "__main__":
    nicholas_cage_is_cool = \
    "http://bzfd.it/2vTReuw"
    process_image_from_url(nicholas_cage_is_cool)
