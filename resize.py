#!/usr/bin/env python
# -*- coding:utf-8 -*-
#
# sfen.py Copyright 2016 shibacho
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api.images import Image
from google.appengine.api import images
from google.appengine.api.app_identity import app_identity

import urllib
import urllib2
import logging
import re

from sfenlib import u2utf8

class ResizeHandler(webapp.RequestHandler):
    WIDTH = 842
    HEIGHT = 421
    def get(self):
        ### height:421px width:400px
        ### width will be about 800px
        # self.response.headers['Content-Type'] = 'image/png'
        ### put out resized png image which matches Twitter card.
        ### Basic concept
        ### 1: Prepare white back png which width is 800px, height is 421px.
        ### 2: put diagram image center of the images

        img = ''
        img_list = []
        ### Make white background image (800x421 px)
        with open('img/whitebase.png', 'rb') as f:
            img = f.read()
        img = images.resize(img, self.WIDTH, self.HEIGHT, allow_stretch=True)
        img_list += [(img, 0, 0, 1.0, images.TOP_LEFT)]

        url = 'http://' + app_identity.get_default_version_hostname() + '/sfen?' + self.request.query_string

        diagram_img = urllib2.urlopen(url).read()
        diagram_img_obj = Image(diagram_img) ### for width, height
        # x = (self.WIDTH - diagram_img_obj.width) // 2
        x = (self.WIDTH - diagram_img_obj.width) // 2
        img_list += [(diagram_img, x, 0, 1.0, images.TOP_LEFT)]

        img = images.composite(img_list, self.WIDTH, self.HEIGHT, color=0xFFFFFFFF)

        self.response.headers['Content-Type'] = 'image/png'
        self.response.out.write(img)

def main():
    application = webapp.WSGIApplication([('/resize', ResizeHandler)],
                                         debug=True)

    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
