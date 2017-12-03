#!usr/bin/python3
#make sure the shebang is pointing at a python 3 interpreter
import json
import cognitive_face as cf
import random
import string
import time

PG = "fuck" # global person group

def cf_setup(config="./config.txt"):
    cf.Key.set(json.load(open(config))["API_KEY"])
    cf.BaseUrl.set("https://westcentralus.api.cognitive.microsoft.com/face/v1.0/")


def setup_person_group(pg="production"):
    cf.person_group.create("production", name="production")
    global PG 
    PG = pg # first time i ever used global, probably a code smell

#use this to add pictures of the presenter
#pics is a txt newline delimited picture filepaths
#remember to downgrade pics so that they're less than 4MB
#and less than 4096x4096 but bigger than 36x36
def add_presenter_pic(presenter_name, pics, PG=PG):
    """pics is a txt file of newline delimited  filepath strings,
       presenter_name is just a first name"""
    poi = cf.person.create(PG, presenter_name)  # person of interest
    print(poi)
    with open(pics, newline='\r\n') as picsfile:
        for fps in picsfile:
            print(fps)
            face = cf.face.detect(fps[-2:])[0]["faceId"]
            cf.person.add_face(face, PG, poi)

def return_random_string():
    return ''.join(random.choice(string.ascii_uppercase+string.digits) for _ in range(10))

# finds and adds faces wee're less than conf_threshold sure we already have 
def handle_unknown_persons(pic, conf_threshold=.5, add_person=False, PG=PG):
    faceids = cf.face.detect(pic)
    found = False
    result2 = False
    for fid in faceids:
        x = fid["faceId"]
        target_box = '{left},{top},{width},{height}'.format(**fid['faceRectangle'])
        result = cf.face.identify([x], PG)
        print(result)
        for faceresult in result[0]["candidates"]:
            print('stupid shit{}'.format(faceresult))
            if faceresult["confidence"] > conf_threshold:
                cf.person.add_face(pic, PG, faceresult["personId"], target_face=target_box)
                found = True
                break
        if not found:
            holder = cf.person.create(PG, return_random_string())
            print("fid: {}".format(fid))
            print([pic, PG, holder])
            cf.person.add_face(pic, PG, holder["personId"], target_face=target_box)
            result2 = True
    return result2


if __name__ == "__main__":
    
    PG = "fuck"
    cf_setup()
    #cf.person_group.create(PG, name=PG)
    #add_presenter_pic(PG, "/home/emrog/Downloads/tempfps")
    #add_presenter_pic(PG, "/home/emrog/Downloads/tempfps2")
    #cf.person_group.train(PG)
    #while cf.person_group.get_status(PG):
    #    print("sleeping for 5")
    #    time.sleep(5)
    print(handle_unknown_persons("/home/emrog/Downloads/cagePic.jpg"))
    print(cf.person_group.get(PG))
