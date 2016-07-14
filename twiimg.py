#!/usr/bin/env python
# -*- coding:utf-8 -*-
#
# sfen.py Copyright 2015 fantakeshi.
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
from time import time

from sfenlib import u2utf8

class TwiimgHandler(webapp.RequestHandler):
    DEFAULT_TITLE = u'局面図'
    def get(self):
        url  = self.request.url
        m = re.search('(.+)\/(.+)', url)
        path = m.group(1)
        
        sfen = urllib.unquote(self.request.get('sfen'))
        sfenurl = "{}/sfen?{}".format(path, self.request.query_string)

        sfen = sfen.replace('\r','')
        sfen = sfen.replace('\n','')

        black_name = u2utf8(urllib.unquote(self.request.get('sname')))
        white_name = u2utf8(urllib.unquote(self.request.get('gname')))
        title = u2utf8(urllib.unquote(self.request.get('title', self.DEFAULT_TITLE)))

        height = 421
        # If board has no name, the image height is smaller.
        if black_name == '' and white_name == '' and self.request.get('title') == '':
            height = 400

        self.response.out.write('<!DOCTYPE html>')
        self.response.out.write('<html>\n<head>\n')
        self.response.out.write('<meta name="twitter:id" content="{}" />\n'.format(str(time())[:-3]))
        self.response.out.write('<meta name="twitter:card" content="summary_large_image" />\n')
        self.response.out.write('<meta name="twitter:site" content="@shibacho" />\n')
        self.response.out.write('<meta name="twitter:description" content="@shibacho" />\n')
        self.response.out.write('<meta name="twitter:title" content="{}" />\n'.format(title))
        if black_name != '' and white_name != '':
            self.response.out.write('<meta name="twitter:description" content="{} vs {}" />\n'.format(black_name, white_name))
        else:
            self.response.out.write('<meta name="twitter:description" content="{}" />\n'.format(title))
        
        self.response.out.write('<meta name="twitter:image" content="{}" />\n'.format(sfenurl))
        self.response.out.write('<meta name="twitter:image:width" content="400" />\n')
        self.response.out.write('<meta name="twitter:image:height" content="421" />\n')
        self.response.out.write('<meta name="twitter:url" content="{}" />\n'.format(sfenurl))
        self.response.out.write('<meta charset="UTF-8" />\n')
        self.response.out.write('</head>\n<body>\n')
        self.response.out.write('<p>\n<div style="text-align:center;">{}</div><br>\n'.format(title))
        self.response.out.write('<img src="{}" />\n'.format(sfenurl))
        self.response.out.write('</body>\n</html>\n')

def main():
    application = webapp.WSGIApplication([('/twiimg', TwiimgHandler)],
                                         debug=True)

    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
