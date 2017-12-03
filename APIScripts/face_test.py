#!/usr/bin/python3
import cognitive_face as CF
import json
import requests
import os

KEY = json.load(open("./config.txt"))
CF.Key.set(KEY["API_KEY"])

BASE_URL = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/"
CF.BaseUrl.set(BASE_URL)


def draw_rectangle(img_fp, rectdict):
    left = rectdict["left"]
    top = rectdict["top"]
    width = rectdict["width"]
    height = rectdict["height"]
    os.system('mogrify -draw "rectangle {},{} {},{}" {}'.format(
            left,
            top - height,
            left + width,
            height,
            img_fp
        ))


def process_image_from_url(img_url):
    face_dict = CF.face.detect(img_url)
    print(json.dumps(face_dict, sort_keys=True, indent=4))


def process_image(img_url):
    img_result = requests.get(img_url).content
    with open("./temp_img", 'wb') as f:
        f.write(img_result)
    face_result = CF.face.detect(img_url)[0]
    draw_rectangle("./temp_img", face_result["faceRectangle"])
    return "./temp_img"
    


if __name__ != "__main__":
#    nicholas_cage_is_cool = "http://bzfd.it/2vTReuw"
#    john_travolta_is_aight = "http://bit.ly/2kfSy7L" # John Travolta
    JUST_DO_IT = "http://bit.ly/2Aru1R8" # shia
#    dynamic_duo = "http://bit.ly/2BGYCdM"
#
#    other_entries_from_my_collection = [
#            "http://bit.ly/2AQSEJV", # Nick Cage
#            JUST_DO_IT
#        ]
#    print("making people")
    pg = "test1"
#    CF.person_group.create(pg, name=pg, user_data="for testing, dummy")
#
    nick_cage = CF.person.create(pg, name="Nicolas Cage", user_data="greatest actor of all time")
    id1 = process_image("http://bit.ly/2AQSEJV")
    CF.person.add_face(id1, pg, nick_cage)
    id2 = process_image("http://bit.ly/1lwN1Te")
    CF.person.add_face(id2, pg, nick_cage)

    shia = CF.person.create(pg, name="Shia LaBoo", user_data="Actual greatest")
#    JUST_DO_IT = CF.face.detect(JUST_DO_IT)
#    CF.person.add_face(JUST_DO_IT, pg, shia)
    
    print("making faces")
    nick_cage_test, *_rest  = CF.face.detect(nicholas_cage_is_cool)
    john_t_test, *_rest = CF.face.detect(john_travolta_is_aight)
    [duo_test1, duo_test2, *_rest] = CF.face.detect(dynamic_duo)

    print("testing\n")
    tests = [nick_cage_test, john_t_test, duo_test1, duo_test2]
    test_results = CF.face.identify(tests, pg)
    print("test results:")
    for result in test_results:
        print("\t", end="")
        print(result)

nick_cage = CF.person.create('test2', name="Nicolas Cage")
CF.person.add_face("http://bit.ly/2AQSEJV", 'test2', nick_cage)
print(CF.person_group.lists())

