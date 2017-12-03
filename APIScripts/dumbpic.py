#!usr/bin/python3
import cognitive_face as cf
import json

cf.Key.set(json.load(open("./config.txt"))["API_KEY"])
BASE_URL = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/"
cf.BaseUrl.set(BASE_URL)

if __name__ == "__main__":
    pg = "fuck"
#    matt = cf.person.create(pg, name="matt")["personId"]
#    pic1 = "/home/emrog/Downloads/pic1x.jpg"
#    pic2 = "/home/emrog/Downloads/pic2x.jpg"
#    pic3 = "/home/emrog/Downloads/pic3x.jpg"
#    cf.person.add_face(pic1, pg, matt)
#    cf.person.add_face(pic2, pg, matt)
#    cf.person_group.train(pg)
#    result = cf.face.detect("/home/emrog/Downloads/cagePic.jpg")[0]["faceId"]
    result = cf.face.detect("/home/emrog/Downloads/pic3x.jpg")[0]["faceId"]
    print(result)
    print(cf.face.identify([result], pg))

