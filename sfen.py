#!/usr/bin/env python
# -*- coding:utf-8 -*- 
#
# sfen.py Copyright 2011 fantakeshi.
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
import urllib2
import logging
import os
import re
import math

ENCODE = 'UTF-8'
def u2utf8(s):
    return s.encode(ENCODE)

class BadSfenStringException(Exception):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)

class PieceKindException(Exception):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)

class SfenHandler(webapp.RequestHandler):
    board_img = ''
    board_alphabet_img = ''
    draw_board_img = ''

    piece_img = {}
    piece_alphabet_img = {}
    piece_international_img = {}
    draw_piece_img = {}

    number_img = {}
    black_img = ()
    white_img = ()
    last_move_img = ''
    string_img = {}
    string_img_obj = {}

    exist_title_flag = False
    max_title_height = 0
    title_height = 0

    TITLE_Y = 5

    IMAGE_WIDTH  = 400
    IMAGE_HEIGHT = 400

    PIECE_IMAGE_WIDTH   = 24
    PIECE_IMAGE_HEIGHT  = 24
    NUMBER_IMAGE_WIDTH  = 12
    NUMBER_IMAGE_HEIGHT = 12

    BLACK_MARK_X = 360
    BLACK_MARK_Y = 5

    WHITE_MARK_X = 10
    WHITE_MARK_Y = 310
    WHITE_TITLE_MARK_X = 5

    BLACK_MARK_WIDTH  = 24
    BLACK_MARK_HEIGHT = 24
    BLACK_MARK_SMALL_WIDTH = 16
    BLACK_MARK_SMALL_HEIGHT = 16
    WHITE_MARK_WIDTH  = 24
    WHITE_MARK_HEIGHT = 24
    WHITE_MARK_SMALL_WIDTH = 16
    WHITE_MARK_SMALL_HEIGHT = 16

    BOARD_X = 50
    BOARD_Y = 15
    BOARD_WIDTH  = 306
    BOARD_HEIGHT = 304

    SQUARE_ORIGIN_X = 6
    SQUARE_ORIGIN_Y = 16
    SQUARE_MULTIPLE_X = 31
    SQUARE_MULTIPLE_Y = 32

    ### 持ち駒の数を右揃えにするパディング値
    NUMBER_IMAGE_PADDING_X = 12
    IMAGE_PADDING_X = 4
    IMAGE_PADDING_Y = 4
    TITLE_PADDING_Y = 8

    BLACK = 0
    WHITE = 1

    DEFAULT_FONT_SIZE = 20

    ### 一度に合成出来る画像の最大数
    COMPOSITE_MAX_NUM = 15

    def img_init(self, piece_kind = 'kanji'):
        if piece_kind == 'kanji':
            self.piece_img_init()
            self.draw_piece_img = self.piece_img
            self.board_img_init()
            self.draw_board_img = self.board_img
        elif piece_kind == 'alphabet':
            self.piece_alphabet_img_init()
            self.draw_piece_img = self.piece_alphabet_img
            self.board_alphabet_img_init()
            self.draw_board_img = self.board_alphabet_img
        elif piece_kind == 'international':
            self.piece_international_img_init()
            self.draw_piece_img = self.piece_international_img
            self.board_alphabet_img_init()
            self.draw_board_img = self.board_alphabet_img
        else:
            raise PieceKindException('No piece kind (' + piece_kind + ')')

        self.mark_img_init()

    def piece_img_init(self):
        ### 画像の初期化が終わっていたらいちいち再読み込みを行わない
        ### Google App Engineでは前の呼び出し時のインスタンスを
        ### 覚えていることがまれによくある
        if self.piece_img != {}:
            return
        
        logging.info('Loading Kanji Piece Image...')

        f = open("img/fu.png", "rb")
        fu_img = f.read()
        f.close()

        f = open("img/ky.png", "rb")
        ky_img = f.read()
        f.close()
        
        f = open("img/ke.png", "rb")
        ke_img = f.read()
        f.close()

        f = open("img/gi.png", "rb")
        gi_img = f.read()
        f.close()

        f = open("img/ki.png", "rb")
        ki_img = f.read()
        f.close()

        f = open("img/hi.png", "rb")
        hi_img = f.read()
        f.close()

        f = open("img/ka.png", "rb")
        ka_img = f.read()
        f.close()

        f = open("img/ou.png", "rb")
        ou_img = f.read()
        f.close()

        f = open("img/to.png", "rb")
        to_img = f.read()
        f.close()

        f = open("img/ny.png", "rb")
        ny_img = f.read()
        f.close()

        f = open("img/nk.png", "rb")
        nk_img = f.read()
        f.close()

        f = open("img/ng.png", "rb")
        ng_img = f.read()
        f.close()

        f = open("img/ry.png", "rb")
        ry_img = f.read()
        f.close()

        f = open("img/um.png", "rb")
        um_img = f.read()
        f.close()

        self.piece_img['p']  = (fu_img, images.rotate(fu_img, 180))
        self.piece_img['l']  = (ky_img, images.rotate(ky_img, 180))
        self.piece_img['n']  = (ke_img, images.rotate(ke_img, 180))
        self.piece_img['s']  = (gi_img, images.rotate(gi_img, 180))
        self.piece_img['g']  = (ki_img, images.rotate(ki_img, 180))
        self.piece_img['r']  = (hi_img, images.rotate(hi_img, 180))
        self.piece_img['b']  = (ka_img, images.rotate(ka_img, 180))
        self.piece_img['k']  = (ou_img, images.rotate(ou_img, 180))
        self.piece_img['+p'] = (to_img, images.rotate(to_img, 180))
        self.piece_img['+l'] = (ny_img, images.rotate(ny_img, 180))
        self.piece_img['+n'] = (nk_img, images.rotate(nk_img, 180))
        self.piece_img['+s'] = (ng_img, images.rotate(ng_img, 180))
        self.piece_img['+r'] = (ry_img, images.rotate(ry_img, 180))
        self.piece_img['+b'] = (um_img, images.rotate(um_img, 180))
        self.piece_img['+g'] = (ki_img, images.rotate(ki_img, 180))

    def piece_alphabet_img_init(self):
        if self.piece_alphabet_img != {}:
            return

        logging.info('Loading Alphabet Piece Image...')

        f = open("img/fu_alphabet.png", "rb")
        fu_img = f.read()
        f.close()

        f = open("img/ky_alphabet.png", "rb")
        ky_img = f.read()
        f.close()
        
        f = open("img/ke_alphabet.png", "rb")
        ke_img = f.read()
        f.close()

        f = open("img/gi_alphabet.png", "rb")
        gi_img = f.read()
        f.close()

        f = open("img/ki_alphabet.png", "rb")
        ki_img = f.read()
        f.close()

        f = open("img/hi_alphabet.png", "rb")
        hi_img = f.read()
        f.close()

        f = open("img/ka_alphabet.png", "rb")
        ka_img = f.read()
        f.close()

        f = open("img/ou_alphabet.png", "rb")
        ou_img = f.read()
        f.close()

        f = open("img/to_alphabet.png", "rb")
        to_img = f.read()
        f.close()

        f = open("img/ny_alphabet.png", "rb")
        ny_img = f.read()
        f.close()

        f = open("img/nk_alphabet.png", "rb")
        nk_img = f.read()
        f.close()

        f = open("img/ng_alphabet.png", "rb")
        ng_img = f.read()
        f.close()

        f = open("img/ry_alphabet.png", "rb")
        ry_img = f.read()
        f.close()

        f = open("img/um_alphabet.png", "rb")
        um_img = f.read()
        f.close()

        self.piece_alphabet_img['p']  = (fu_img, images.rotate(fu_img, 180))
        self.piece_alphabet_img['l']  = (ky_img, images.rotate(ky_img, 180))
        self.piece_alphabet_img['n']  = (ke_img, images.rotate(ke_img, 180))
        self.piece_alphabet_img['s']  = (gi_img, images.rotate(gi_img, 180))
        self.piece_alphabet_img['g']  = (ki_img, images.rotate(ki_img, 180))
        self.piece_alphabet_img['r']  = (hi_img, images.rotate(hi_img, 180))
        self.piece_alphabet_img['b']  = (ka_img, images.rotate(ka_img, 180))
        self.piece_alphabet_img['k']  = (ou_img, images.rotate(ou_img, 180))
        self.piece_alphabet_img['+p'] = (to_img, images.rotate(to_img, 180))
        self.piece_alphabet_img['+l'] = (ny_img, images.rotate(ny_img, 180))
        self.piece_alphabet_img['+n'] = (nk_img, images.rotate(nk_img, 180))
        self.piece_alphabet_img['+s'] = (ng_img, images.rotate(ng_img, 180))
        self.piece_alphabet_img['+r'] = (ry_img, images.rotate(ry_img, 180))
        self.piece_alphabet_img['+b'] = (um_img, images.rotate(um_img, 180))
        self.piece_alphabet_img['+g'] = (ki_img, images.rotate(ki_img, 180))
    
    def piece_international_img_init(self):
        if self.piece_international_img != {}:
            return

        logging.info('Loading International Piece Image...')

        f = open("img/fu_international.png", "rb")
        fu_img = f.read()
        f.close()

        f = open("img/ky_international.png", "rb")
        ky_img = f.read()
        f.close()
        
        f = open("img/ke_international.png", "rb")
        ke_img = f.read()
        f.close()

        f = open("img/gi_international.png", "rb")
        gi_img = f.read()
        f.close()

        f = open("img/ki_international.png", "rb")
        ki_img = f.read()
        f.close()

        f = open("img/hi_international.png", "rb")
        hi_img = f.read()
        f.close()

        f = open("img/ka_international.png", "rb")
        ka_img = f.read()
        f.close()

        f = open("img/ou_international.png", "rb")
        ou_img = f.read()
        f.close()

        f = open("img/to_international.png", "rb")
        to_img = f.read()
        f.close()

        f = open("img/ny_international.png", "rb")
        ny_img = f.read()
        f.close()

        f = open("img/nk_international.png", "rb")
        nk_img = f.read()
        f.close()

        f = open("img/ng_international.png", "rb")
        ng_img = f.read()
        f.close()

        f = open("img/ry_international.png", "rb")
        ry_img = f.read()
        f.close()

        f = open("img/um_international.png", "rb")
        um_img = f.read()
        f.close()

        self.piece_international_img['p']  = (fu_img, images.rotate(fu_img, 180))
        self.piece_international_img['l']  = (ky_img, images.rotate(ky_img, 180))
        self.piece_international_img['n']  = (ke_img, images.rotate(ke_img, 180))
        self.piece_international_img['s']  = (gi_img, images.rotate(gi_img, 180))
        self.piece_international_img['g']  = (ki_img, images.rotate(ki_img, 180))
        self.piece_international_img['r']  = (hi_img, images.rotate(hi_img, 180))
        self.piece_international_img['b']  = (ka_img, images.rotate(ka_img, 180))
        self.piece_international_img['k']  = (ou_img, images.rotate(ou_img, 180))
        self.piece_international_img['+p'] = (to_img, images.rotate(to_img, 180))
        self.piece_international_img['+l'] = (ny_img, images.rotate(ny_img, 180))
        self.piece_international_img['+n'] = (nk_img, images.rotate(nk_img, 180))
        self.piece_international_img['+s'] = (ng_img, images.rotate(ng_img, 180))
        self.piece_international_img['+r'] = (ry_img, images.rotate(ry_img, 180))
        self.piece_international_img['+b'] = (um_img, images.rotate(um_img, 180))
        self.piece_international_img['+g'] = (ki_img, images.rotate(ki_img, 180))
    

    def board_img_init(self):
        if self.board_img == '':
            logging.info('Loading Board Image...')
            f = open("img/board.png", "rb")
            self.board_img = f.read()
            f.close()

    def board_alphabet_img_init(self):
        if self.board_alphabet_img == '':
            logging.info('Loading Alphabet Board Image...')
            f = open("img/board_alphabet.png", "rb")
            self.board_alphabet_img = f.read()
            f.close()
            
    def mark_img_init(self):
        if self.black_img == ():
            logging.info('Loading Black Image...')
            f = open("img/black.png", "rb")
            img = f.read()
            f.close()
            self.black_img = (img, images.rotate(img, 180), images.resize(img, 16, 16) )

        if self.white_img == ():
            logging.info('Loading White Image...')
            f = open("img/white.png", "rb")
            img = f.read()
            f.close()
            self.white_img = (img, images.rotate(img, 180), images.resize(img, 16, 16) )

    def number_img_init(self, num):

        if self.number_img.get(str(num)) == None:
            logging.info('Loading ' + str(num) + '.png ...')
            f = open("img/" + str(num) + ".png", "rb")
            num_img = f.read()
            self.number_img[str(num)] = (num_img, 
                                         images.rotate(num_img, 180))
            f.close()

    def last_move_img_init(self):
        if self.last_move_img == '':
            logging.info('Loading lm.png ...')
            f = open("img/lm.png", "rb")
            self.last_move_img = f.read()
            f.close()

    def get_string_img(self, string, font_size = 16):
        '''
        Get String Image by Google Charts API.
        Google Charts API can convert Japanese characters to an image.
        This function maybe raise urllib.urlopen()'s exception.
        If string is empty, the return value is (None, None).

        日本語を含む文字列を画像にしてGoogle Charts APIから取ってくる
        urllib.urlopen() が投げる例外を送出する可能性がある
        空の文字列が渡されたら(None, None)が帰ります

        '''
        if string == '' or string is None:
             return (None, None)

        if self.string_img.get(string) == None:
            url = 'http://chart.apis.google.com/chart?chst=d_text_outline'\
                  '&chld=000000|' + str(font_size) + '|l|000000|_|'
            url += urllib.quote(u2utf8(string))

            logging.info(u2utf8(string) + ' -> URL:' + url)
            img = urllib2.urlopen(url).read()
            img_obj = Image(img) ### for width,height

            self.string_img_obj[string] = img_obj
            self.string_img[string] = images.resize(img, img_obj.width, img_obj.height)

        return (self.string_img[string], self.string_img_obj[string])

    def draw_turn_mark(self, img_list, x, y):
        self.last_move_img_init()
        image = images.resize(self.last_move_img, 
                              self.BLACK_MARK_WIDTH + 10, 
                              self.BLACK_MARK_HEIGHT + 10)

        img_list.append( (image, x - 5, y - 5, 1.0, images.TOP_LEFT) )
        return self.composite(img_list)

    def sort_hand_array(self, hand_dict):
        ''' 
        Sort hand dict to 
        rook -> bishop -> gold -> silver -> knight -> lance -> pawn.
        飛 -> 角 -> 金 -> 銀 -> 桂 -> 香 -> 歩 の順番にarrayに入れる
        '''
        result = []
        if hand_dict.has_key('r'):
            result.append( ('r', hand_dict['r']) )
            
        if hand_dict.has_key('b'):
            result.append( ('b', hand_dict['b']) )
        
        if hand_dict.has_key('g'):
            result.append( ('g', hand_dict['g']) )

        if hand_dict.has_key('s'):
            result.append( ('s', hand_dict['s']) )

        if hand_dict.has_key('n'):
            result.append( ('n', hand_dict['n']) )
        
        if hand_dict.has_key('l'):
            result.append( ('l', hand_dict['l']) )

        if hand_dict.has_key('p'):
            result.append( ('p', hand_dict['p']) )

        return result

    def sfen_parse(self, sfen):
        board = {}
        white_hand = {}
        black_hand = {}
        move_count = '0'

        sfen_tokens = sfen.split(' ')
        logging.info('sfen:' + sfen + ' :token_num:' + str(len(sfen_tokens)))
        if len(sfen_tokens) == 4:
            pieces = sfen_tokens[0]
            turn = sfen_tokens[1]
            inhand = sfen_tokens[2]
            move_count = sfen_tokens[3]
        elif len(sfen_tokens) == 3:
            pieces = sfen_tokens[0]
            turn = sfen_tokens[1]
            inhand = sfen_tokens[2]
        elif len(sfen_tokens) == 2:
            pieces = sfen_tokens[0]
            turn = sfen_tokens[1]
        elif len(sfen_tokens) == 1:
            pieces = sfen_tokens[0]
            turn = '-' ### 省略時はbでもwでもない値
        else:
            raise BadSfenStringException('Token number is too much.')

        rows = pieces.split('/')
        if len(rows) != 9:
            raise BadSfenStringException('Row number is not enough.')

        for i, a_row in enumerate(rows):
            col_num = i + 1;
            col_str = str(col_num)
            chars = list(a_row)
            row_counter = 9
            row_str = str(row_counter)
            
            promote_flag = False
            for a_char in chars:
                if a_char.isdigit():
                    for k in range(int(a_char)):
                        row_counter -= 1
                        row_str = str(row_counter)
                elif a_char == '+':
                    promote_flag = True
                else:
                    if promote_flag == True:
                        board[row_str + col_str] = '+' + a_char
                        promote_flag = False
                    else:
                        board[row_str + col_str] = a_char
                    row_counter -= 1
                    row_str = str(row_counter)

        if len(sfen_tokens) >= 3 and inhand != '-':
            hands = list(inhand)
            hand_num = 0
            for a_hand in hands:
                if a_hand.isdigit():
                    if hand_num != 0: ### 2ケタの場合
                        hand_num = hand_num * 10 + int(a_hand)
                    else:
                        hand_num = int(a_hand)
                elif a_hand.isupper():
                    if hand_num == 0:
                        hand_num = 1

                    logging.debug('black_hand:[' + str(a_hand) + '] = ' + str(hand_num))
                    a_hand = a_hand.lower() ### For sort after
                    black_hand[a_hand] = hand_num

                    hand_num = 0
                elif a_hand.islower():
                    if hand_num == 0:
                        hand_num = 1
                    logging.debug('white_hand:[' + str(a_hand) + '] = ' + str(hand_num))
                    white_hand[a_hand] = hand_num
                    hand_num = 0

        return (board, black_hand, white_hand, turn, move_count)

    def draw_hand_pieces(self, img, hand_tuples, x, y, turn):
        img_list = [(img, 0, 0, 1.0, images.TOP_LEFT)]
        ### 黒の場合は数字は右寄せにする
        if turn == self.BLACK:
            two_digit_x = x ### 2ケタ目
            one_digit_x = x + self.NUMBER_IMAGE_PADDING_X ### 1ケタ目
        elif turn == self.WHITE:
            two_digit_x = x + self.NUMBER_IMAGE_PADDING_X ### 2ケタ目
            one_digit_x = x ### 1ケタ目

        for hand_tuple in hand_tuples:
            img_list.append((self.draw_piece_img[hand_tuple[0]][turn], 
                             x, y, 1.0, images.TOP_LEFT))

            logging.debug('Drawing:' + str(hand_tuple[0]) + 
                          ' num:' + str(hand_tuple[1]) +
                          ' y:' + str(y) + ' turn:' + str(turn))

            ### 持ち駒が複数ある時は数字の描画をする
            if hand_tuple[1] > 1: 
                num = hand_tuple[1]

                ### 数字を描画する前 
                if turn == self.BLACK:
                    y += (self.PIECE_IMAGE_HEIGHT + self.IMAGE_PADDING_Y)
                else:
                    y -= (self.NUMBER_IMAGE_HEIGHT + self.IMAGE_PADDING_Y)

                ### 10以上の時は2ケタ目を描画
                if num >= 10:
                    hand_str = str(num / 10)
                    if self.number_img.has_key(hand_str) == False:
                        self.number_img_init(hand_str)

                    img_list.append((self.number_img[hand_str][turn], 
                                     two_digit_x , y, 1.0, images.TOP_LEFT))
                    num %= 10 ### 1ケタ目にする

                hand_str = str(num)
                if self.number_img.has_key(hand_str) == False:
                    self.number_img_init(hand_str)

                img_list.append((self.number_img[hand_str][turn], 
                                 one_digit_x, y, 1.0, images.TOP_LEFT))

                ### 数字を描画し終わった後
                if turn == self.BLACK:
                    y += (self.NUMBER_IMAGE_HEIGHT + self.IMAGE_PADDING_Y)
                else:
                    y -= (self.PIECE_IMAGE_HEIGHT + self.IMAGE_PADDING_Y)
            else:
                if turn == self.BLACK:
                    y += (self.PIECE_IMAGE_HEIGHT + self.IMAGE_PADDING_Y)
                else:
                    y -= (self.PIECE_IMAGE_HEIGHT + self.IMAGE_PADDING_Y)

            if len(img_list) == self.COMPOSITE_MAX_NUM:
                (img, img_list) = self.composite(img_list)

        ### 最後にまとめて描画
        (img, img_list) = self.composite(img_list)

        return (img, img_list)
    
    def create_arrow_img(self, img_list, arrow_str, board_y):
        '''
        Create arrow image and add img_list.

        img_list: Original img_list
        arrow_str: String given arrow argument (e.g: 77,76 11,12|12,13)
        board_y: board_y 
        return value:(Image, Image List)

        This method cannot be run, 
        because I don't know image rotating WebAPI for any degree.

        矢印の回転画像を合成し追加する
        現在は矢印画像を任意の向きに回転させるWebAPIが見つからないため動きません
        '''
        return self.composite(img_list)

#        arrow_tokens = arrow_str.split('|')
#        arrow_positions = []
        ### 文字列を解析して 矢印のリストを作る
#        for arrow_token in arrow_tokens:
#            positions = arrow_token.split(',')
#            if len(positions) == 2:
#                begin_pos = positions[0]
#                end_pos = positions[1]
#                arrow_positions.append( (begin_pos, end_pos) )

#        for arrow_pos in arrow_positions:
#            begin_x = 0
#            begin_y = 0
#            end_x = 0
#            end_y = 0

#        return self.composite(img_list)
            


    ### 一旦描画して描画済みの(img, img_list)のtupleを返す
    def composite(self, img_list):
        if len(img_list) == 1:
            return (img_list[0][0], img_list)

        img = images.composite(img_list, self.IMAGE_WIDTH, 
                               self.IMAGE_HEIGHT + self.max_title_height, 
                               color = 0xFFFFFFFF)

        img_list = [(img, 0, 0, 1.0, images.TOP_LEFT)]
        logging.debug("composite success:")
        return (img, img_list)

    def get(self):
        sfen = urllib.unquote(self.request.get('sfen'))
        last_move = urllib.unquote(self.request.get('lm'))
        piece_kind = urllib.unquote(self.request.get('piece','kanji'))
        arrow_str = urllib.unquote(self.request.get('arrow'))
        turn_str = urllib.unquote(self.request.get('turn', 'on'))

        logging.info('sfen:' + sfen + ' last_move:' + last_move)
        if sfen == '':
            self.response.out.write('Please, specify SFEN string.')
            return

        if piece_kind == 'kanji':
            move_count_prefix = ''
            move_count_suffix = u' 手目'
        else:
            move_count_prefix = 'at '
            move_count_suffix = ''

        ### Remove CR LF
        sfen = sfen.replace('\r','')
        sfen = sfen.replace('\n','')

        black_name = urllib.unquote(self.request.get('sname'))
        white_name = urllib.unquote(self.request.get('gname'))
        title = urllib.unquote(self.request.get('title'))

        font_size_str = urllib.unquote(self.request.get('fontsize'))
        if font_size_str.isdigit():
            font_size = int(font_size_str)
        else:
            font_size = self.DEFAULT_FONT_SIZE

        try:
            self.img_init(piece_kind = piece_kind)
            img_list = []
            (board, black_hand, white_hand, turn_sfen, move_count) = self.sfen_parse(sfen)
            (black_name_img, black_name_img_obj) = self.get_string_img(black_name, font_size)
            (white_name_img, white_name_img_obj) = self.get_string_img(white_name, font_size)
            (title_img, title_img_obj) = self.get_string_img(title, font_size)

            if move_count != '0':
                move_count_str = move_count_prefix + move_count + move_count_suffix
                (move_count_img, move_count_img_obj) = self.get_string_img(move_count_str, font_size)

        except BadSfenStringException, e:
            logging.error('Invalid sfen string:' + str(e))
            self.response.out.write('Invalid sfen string:' + str(e))
            return
        except PieceKindException, e:
            logging.error('Invalid piece kind:' + str(e))
            self.response.out.write('Invalid piece kind:' + str(e))
            return
        except IOError, e:
            logging.error('Cannot create string image:' + str(e))
            self.response.out.write('Cannot create string image:' + str(e))
            return

        if black_name != '' or white_name != '' or title != '' or move_count != '0':
            self.exist_title_flag = True
            if black_name is not None:
                logging.info('black_name:' + u2utf8(black_name))

            if white_name is not None:
                logging.info('white_name:' + u2utf8(white_name))

            if title is not None:
                logging.info('title:' + u2utf8(title))

            if move_count != '0':
                logging.info('move_count:' + move_count)
        else:
            logging.info('No titles found.')
            self.exist_title_flag = False
            self.max_title_height = 0
            self.title_height = 0

        ### タイトル等が存在したら最大の高さを求めて必要に応じて描画する
        if self.exist_title_flag == True:
            self.max_title_height = self.BLACK_MARK_SMALL_HEIGHT
            if black_name_img_obj is not None and black_name_img_obj.height > self.max_title_height:
                self.max_title_height = black_name_img_obj.height

            if white_name_img_obj is not None and white_name_img_obj.height > self.max_title_height:
                self.max_title_height = white_name_img_obj.height
                
            if title_img_obj is not None and title_img_obj.height > self.max_title_height:
                self.max_title_height = title_img_obj.height

            logging.info('max_title_height:' + str(self.max_title_height))

            self.title_height = self.TITLE_Y + (self.max_title_height * 2) + self.IMAGE_PADDING_Y

            ### 先手のマークを書く位置を画像の右端から求める
            if black_name_img is not None:
                logging.info('Drawing Black Name:' + u2utf8(black_name) + 
                             ' width:' + str(black_name_img_obj.width) + 
                             ' height:' + str(black_name_img_obj.height))

                black_title_x_left = self.IMAGE_WIDTH - (black_name_img_obj.width +
                                                         self.BLACK_MARK_SMALL_WIDTH + 
                                                         self.IMAGE_PADDING_X)

                black_title_x = black_title_x_left
                img_list.append( (self.black_img[2], black_title_x, 
                                  self.TITLE_Y, 1.0, images.TOP_LEFT) )
                
                black_title_x += self.BLACK_MARK_SMALL_WIDTH + self.IMAGE_PADDING_X
                img_list.append( (black_name_img, black_title_x,
                                  self.TITLE_Y, 1.0, images.TOP_LEFT) )

            ### 後手のマークと名前を描画する
            if white_name_img is not None:
                logging.info('Drawing White Name:' + u2utf8(white_name) + 
                             ' width:' + str(white_name_img_obj.width) +
                             ' height:' + str(white_name_img_obj.height) )
                white_title_x = self.WHITE_TITLE_MARK_X
                img_list.append( (self.white_img[2], white_title_x,
                                  self.TITLE_Y, 1.0, images.TOP_LEFT) )

                white_title_x += self.WHITE_MARK_SMALL_WIDTH + self.IMAGE_PADDING_X
                img_list.append( (white_name_img, white_title_x,
                                  self.TITLE_Y, 1.0, images.TOP_LEFT) )
                white_title_x_right = (white_title_x + 
                                       white_name_img_obj.width + 
                                       self.IMAGE_PADDING_X)

            
            ### 中央タイトルの描画
            if title_img is not None:
                center = self.IMAGE_WIDTH / 2

                ### 文字の長さに合わせて描画開始位置を調整
                center_x = center - title_img_obj.width / 2
                img_list.append( (title_img, center_x,
                                  self.TITLE_Y + self.max_title_height + self.IMAGE_PADDING_Y,
                                  1.0, images.TOP_LEFT) )

            if move_count != '0':
                center = self.IMAGE_WIDTH / 2
                center_x = center - move_count_img_obj.width / 2
                img_list.append( (move_count_img, center_x, self.TITLE_Y, 1.0, images.TOP_LEFT) )


        logging.info('max_title_height:' + str(self.max_title_height))
        if len(img_list) != 0:
            (img, img_list) = self.composite(img_list)

        ### 飛 -> 角 -> 金 -> 銀 -> 桂 -> 香 -> 歩 の順番にarrayに入れる
        white_hand_array = self.sort_hand_array(white_hand)
        black_hand_array = self.sort_hand_array(black_hand)

        ### 最終着手マスの描画
        ### 最終着手マスは &lm=76 (７六のマスを強調表示)のような形式で渡される
        ### TODO: チェス方式(76 -> 7f) も対応したい
        if last_move != '':
            m = re.compile('^([1-9])([1-9])$').match(last_move)
            if m is not None:
                logging.info('Valid last_move:')
                self.last_move_img_init()
                col = int(m.group(1))
                row = int(m.group(2))
                lm_x = (self.SQUARE_ORIGIN_X - 1 + self.BOARD_X + 
                        self.SQUARE_MULTIPLE_X * (9 - int(col)) )
                lm_y = (self.SQUARE_ORIGIN_Y - 1 + self.BOARD_Y + 
                        self.title_height + 
                        self.SQUARE_MULTIPLE_Y * (int(row) - 1) )
                img_list.append((self.last_move_img, lm_x, lm_y, 0.5, images.TOP_LEFT))

        ### 盤の描画
        ### 最終着手マスより後に書くのは盤上の星が上に来て欲しいため
        img_list.append( (self.draw_board_img, self.BOARD_X, 
                          self.BOARD_Y + self.title_height, 
                          1.0, images.TOP_LEFT) )

        ### 盤上の駒の描画
        for pos, piece in board.iteritems():
            turn = self.BLACK
            piece_kind = piece.replace('+','')
            if piece_kind.isupper():
                turn = self.BLACK
            elif piece_kind.islower():
                turn = self.WHITE

            [col, row] = list(pos)
            piece_lower = piece.lower()

            ### 駒を書く場所を決める
            x = self.BOARD_X + self.SQUARE_ORIGIN_X + self.SQUARE_MULTIPLE_X * (9 - int(col))
            y = self.BOARD_Y + self.SQUARE_ORIGIN_Y + self.title_height + self.SQUARE_MULTIPLE_Y * (int(row) - 1)
            logging.debug("x:" + str(x) + " y:" + str(y) + 
                         " pos:" + pos + " piece:" + piece_lower + 
                         " turn:" + str(turn))
            img_list.append((self.draw_piece_img[piece_lower][turn],
                             x, y, 1.0, images.TOP_LEFT))

            if len(img_list) == self.COMPOSITE_MAX_NUM:
                (img, img_list) = self.composite(img_list)

        (img, img_list) = self.composite(img_list)
        logging.info('Success to draw pieces.')

        ### 手番を書く
        if turn_str == 'on':
            logging.info('draw_turn:' + turn_sfen + 
                         ' title_height:' + str(self.title_height))
            if turn_sfen == 'b':
                (img, img_list) = self.draw_turn_mark(img_list, self.BLACK_MARK_X,
                                                      self.BLACK_MARK_Y + 
                                                      self.title_height)
            elif turn_sfen == 'w':
                (img, img_list) = self.draw_turn_mark(img_list, self.WHITE_MARK_X,
                                                      self.WHITE_MARK_Y + 
                                                      self.title_height)

        ### 先手のマークを表示する
        img_list.append( (self.black_img[0], self.BLACK_MARK_X, 
                          self.BLACK_MARK_Y + self.title_height, 
                          1.0, images.TOP_LEFT) )

        ### 後手のマークを表示する
        img_list.append( (self.white_img[1], self.WHITE_MARK_X, 
                          self.WHITE_MARK_Y + self.title_height,
                          1.0, images.TOP_LEFT) )
        (img, img_list) = self.composite(img_list)
        logging.info('Success to draw black/white marks.')

        ### 後手の手持ちの駒を描画
        pos_x = self.WHITE_MARK_X
        pos_y = self.WHITE_MARK_Y + self.title_height - (self.PIECE_IMAGE_HEIGHT + self.IMAGE_PADDING_Y)

        (img, img_list) = self.draw_hand_pieces(img, white_hand_array, 
                                                pos_x, pos_y, self.WHITE)

        ### 先手の手持ちの駒を描画
        pos_x = self.BLACK_MARK_X
        pos_y = self.BLACK_MARK_Y + self.title_height + (self.BLACK_MARK_HEIGHT + self.IMAGE_PADDING_Y)
        (img, img_list) = self.draw_hand_pieces(img, black_hand_array, 
                                                pos_x, pos_y, self.BLACK)

        ### 矢印を書く(予定)
#        if arrow_str != '':
#            (img, img_list) = self.create_arrow_img(img_list, arrow_str)
#            (img, img_list) = self.composite(img_list)


        self.response.headers['Content-Type'] = 'image/png'
        self.response.out.write(img)

def main():
    application = webapp.WSGIApplication([('/sfen', SfenHandler)],
                                         debug=True)
    
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
