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

import urllib
import logging
import re

from sfenlib import u2utf8

class ResizeHandler(webapp.RequestHandler):
    def get(self):
        ### height:421 width:400
        self.response.headers['Content-Type'] = 'image/png'
        ### put out resized png image which matches Twitter card.

def main():
    application = webapp.WSGIApplication([('/resize', ResizeHandler)],
                                         debug=True)

    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
