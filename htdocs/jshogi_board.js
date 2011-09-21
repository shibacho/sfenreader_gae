// -*- coding: utf-8 -*-
//
// jshogi_board.js Copyright 2011 fantakeshi.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var PATH = 'http://' + location.host + '/';

String.prototype.toArray = function() {
    var array = new Array;
    for (var i=0 ; i < this.length; i++) {
        array.push(this.charAt(i));
    }
    return array;
};

if (typeof window.console != 'object') { // for IE
    window.console = { 
        log:function(){}      
    };
}

if (!this['ShogiBoard']) {
    var ShogiBoard = function() {
        this.board_status = new Array;
        for (var i = 0;i < 100;i++) {
            this.board_status[i] = 0;
        }

        this.piece_kind = { ' * ':0,
                            'FU':1 , 'KY':2 , 'KE':3 , 'GI':4 , 
                            'KI':5 , 'KA':6 , 'HI':7 , 'OU':8 , 
                            'TO':9 , 'NY':10, 'NK':11, 'NG':12, 
                            'NA':13, 'UM':14, 'RY':15 };
        this.piece_name = [ ' * ', 'FU', 'KY', 'KE', 'GI', 
                            'KI', 'KA', 'HI', 'OU', 'TO', 
                            'NY', 'NK', 'NG', 'NA', 'UM', 'RY'];
        this.sfen_dict = { 'FU':'p' , 'KY':'l' , 'KE':'n' , 'GI':'s' ,
                           'KI':'g' , 'KA':'b' , 'HI':'r' , 'OU':'k' ,
                           'TO':'+p', 'NY':'+l', 'NK':'+n', 'NG':'+s',
                           'NA':'+g', 'UM':'+b', 'RY':'+r' };
        this.piece_kanji_dict = { 'FU':'歩', 'KY':'香' , 'KE':'桂' , 'GI':'銀',
                                  'KI':'金', 'KA':'角' , 'HI':'飛' , 'OU':'玉',
                                  'TO':'と', 'NY':'杏' , 'NK':'圭' , 'NG':'全',
                                  'NA':'金', 'UM':'馬' , 'RY':'龍'};
        this.kanji_num = [ '〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
                           '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八'];


        this.sfen_name = [ ''  , 'p' , 'l' , 'n' , 's' , 'g' , 'b' , 'r' ,
                           'k' , '+p', '+l', '+n', '+s', '+g', '+b', '+r'];
        this.kanji_name = [''  , '歩' , '香' , '桂' , '銀' , '金' , '角' , '飛' ,
                           '王' , 'と', '杏', '圭', '全', '金', '馬', '龍'];

        // for hand piece sorts.
        this.hand_piece_order = [ 'HI', 'KA', 'KI', 'GI', 'KE', 'KY', 'FU'];

        this.black_hand_pieces = {};
        this.white_hand_pieces = {};

        for (var i = 0;i < this.hand_piece_order.length; i++) {
            this.black_hand_pieces[this.hand_piece_order[i]] = 0;
            this.white_hand_pieces[this.hand_piece_order[i]] = 0;
        }

    };
    
    ShogiBoard.prototype = {
        EMPTY:0,
        BLACK:1,
        WHITE:2,
        WHITE_BIT:0x10,
        FU:1, KY:2 , KE:3 , GI:4 , KI:5 , KA:6 , HI:7 , OU:8,
        TO:9, NY:10, NK:11, NG:12, NA:13, UM:14, RY:15,
        PROMOTE_THRESHOLD:9, PROMOTE_PLUS:8,
        initEvenGame : function() {
            console.log('ShogiBoard.initEvenGame(): Called.');
            this.board_status[11] = this.board_status[91] = 
                    this.piece_kind['KY'] | this.WHITE_BIT;
            this.board_status[21] = this.board_status[81] = 
                    this.piece_kind['KE'] | this.WHITE_BIT;
            this.board_status[31] = this.board_status[71] = 
                    this.piece_kind['GI'] | this.WHITE_BIT;
            this.board_status[41] = this.board_status[61] =
                    this.piece_kind['KI'] | this.WHITE_BIT;
            this.board_status[51] = this.piece_kind['OU'] | this.WHITE_BIT;
            this.board_status[22] = this.piece_kind['KA'] | this.WHITE_BIT;
            this.board_status[82] = this.piece_kind['HI'] | this.WHITE_BIT;
            this.board_status[13] = 
                    this.board_status[23] = this.board_status[33] = 
                    this.board_status[43] = this.board_status[53] =
                    this.board_status[63] = this.board_status[73] =
                    this.board_status[83] = this.board_status[93] =
                    this.piece_kind['FU'] | this.WHITE_BIT;

            this.board_status[19] = this.board_status[99] =
                    this.piece_kind['KY'];
            this.board_status[29] = this.board_status[89] =
                    this.piece_kind['KE'];
            this.board_status[39] = this.board_status[79] =
                    this.piece_kind['GI'];
            this.board_status[49] = this.board_status[69] =
                    this.piece_kind['KI'];
            this.board_status[88] = this.piece_kind['KA'];
            this.board_status[28] = this.piece_kind['HI'];
            this.board_status[59] = this.piece_kind['OU'];

            this.board_status[17] =
                    this.board_status[27] = this.board_status[37] =
                    this.board_status[47] = this.board_status[57] =
                    this.board_status[67] = this.board_status[77] =
                    this.board_status[87] = this.board_status[97] =
                    this.piece_kind['FU'];
        },
        getPieceNameFromStatus: function(status) {
            status &= (~this.WHITE_BIT);
            return this.piece_name[status];
        },
        getBoardStatus: function(pos) {
            var status = this.board_status[pos];
            if (status == 0) {
                return [this.EMPTY, this.getPieceNameFromStatus(status)];
            }
            else if (status & this.WHITE_BIT) {
                return [this.WHITE, this.getPieceNameFromStatus(status)];
            } else {
                return [this.BLACK, this.getPieceNameFromStatus(status)];
            }
        },
        getSquarePieceTurn: function(pos) {
            if (this.board_status[pos] == 0){
                return turn.EMPTY;
            } else if (this.board_status[pos] & this.WHITE_BIT) {
                return turn.WHITE;
            } else {
                return turn.BLACK;
            }
        },
        setBoardStatus: function(pos, turn, piece) {
            if (turn == this.BLACK) {
                this.board_status[pos] = piece;
            } else {
                this.board_status[pos] = (piece | this.WHITE_BIT);
            }
        },
        getAllPieces: function() {
            var pieces = new Array;
            for (var i = 0;i < 100;i++) {
                if (this.board_status[i] != 0) {
                    console.log('i:' + i + ' status:' + 
                                this.board_status[i]);
                    pieces.push([i, this.getBoardStatus(i) ]);
                }
            }
            return pieces;
        },
        getHandPieces: function(turn) {
            if (turn == this.BLACK) {
                return this.black_hand_pieces;
            } else if (turn == this.WHITE) {
                return this.white_hand_pieces;
            } else {
                return undefined;
            }
        },
        addHandPiece: function (turn, piece) {
            var hand_piece_array = undefined;
            piece &= ~this.WHITE_BIT;
            if (piece >= this.PROMOTE_THRESHOLD) {
                piece -= this.PROMOTE_PLUS;
            }
            console.log('addHandPiece(' + turn + ',' + piece + ')');
            if (turn == this.BLACK) {
                hand_piece_array = this.black_hand_pieces;
            } else if (turn == this.WHITE) {
                hand_piece_array = this.white_hand_pieces;
            }

            var piece_name = this.getPieceNameFromStatus(piece);
            var piece_num = hand_piece_array[piece_name];
            if (typeof piece_num == 'undefined') {
                piece_num = 1;
            } else {
                piece_num ++;
            }

            console.log('turn:' + (turn == this.BLACK ? 'BLACK' : 'WHITE'));
            hand_piece_array[piece_name] = piece_num;
            console.log('piece_name:' + piece_name + ':' + piece_num);
        },
        swapBoardPieces: function (begin, end) {
            console.log('swapBoardPieces:' + begin + ' -> ' + end);
            console.log('begin_status:' + this.board_status[begin]);
            console.log('end_status:' + this.board_status[end]);

            if (this.board_status[begin] == 0) {
                return;
            }

            if (begin == end) {
                return;
            }

            if (end < 10) {
                var status = this.getBoardStatus(begin);
                if (end == 0) { // Black Piece Stand.
                    console.log('addHandPiece to BLACK.');
                    this.addHandPiece(this.BLACK, this.board_status[begin]);
                } else if (end == 1) { // White Piece Stand.
                    console.log('addHandPiece to WHITE.');
                    this.addHandPiece(this.WHITE, this.board_status[begin]);
                }

                this.board_status[begin] = 0;
            } else {
                var end_piece_name = 
                        this.getPieceNameFromStatus(this.board_status[end]);
                console.log('end_status:' + this.board_status[end] +
                            ' end_piece_name:' + end_piece_name);
                
                var status_begin = this.board_status[begin];
                var status_end = this.board_status[end];

                var begin_piece = this.board_status[begin];
                var end_piece = this.board_status[end];

                console.log('begin_piece:' + begin_piece + ' end_piece:' + end_piece);
                var begin_turn = this.getBoardStatus(begin)[0];
                var end_turn = this.getBoardStatus(end)[0];

                if (end_piece != 0 && begin_turn != end_turn && 
                    end_piece_name != 'OU') {
                    console.log('begin_turn:' + begin_turn + 
                                ' end_turn:' + end_turn);
                    if (begin_turn != end_turn) {
                        this.addHandPiece(begin_turn, end_piece);
                    }

                    this.board_status[end] = status_begin;
                    this.board_status[begin] = 0;
                } else {
                    this.board_status[end] = status_begin;
                    this.board_status[begin] = status_end;
                }
                
            }

        },
        dropPieceFromStand: function (turn, piece_name, to_pos) {
            console.log('dropPieceFromStand: turn:' + turn + 
                        ' piece_name:' + piece_name +
                        ' to_pos:' + to_pos);
            var piece_kind = this.piece_kind[piece_name];
            if (turn == this.WHITE) {
                this.white_hand_pieces[piece_name]--;
                this.board_status[to_pos] = piece_kind | this.WHITE_BIT;
            } else if (turn == this.BLACK) {
                this.black_hand_pieces[piece_name]--;
                this.board_status[to_pos] = piece_kind;
            }
        },
        givePieceFromStand: function(from_turn, piece_name) {
            console.log('givePieceFromStand(' + from_turn + ',' + piece_name + ')');
            var piece_kind = this.piece_kind[piece_name];
            if (from_turn == this.WHITE) {
                this.white_hand_pieces[piece_name]--;
                this.black_hand_pieces[piece_name]++;
            } else if (from_turn == this.BLACK) {
                this.black_hand_pieces[piece_name]--;
                this.white_hand_pieces[piece_name]++;
            }
            
        },
        changePieceKind: function(pos) {
            if (pos <= 11 || pos >= 100) {
                return;
            }

            console.log('changePieceKind(' + pos + ')');
            /// 先手駒 -> 先手成駒 -> 後手駒 -> 後手成駒の順
            if (this.board_status[pos] == 0) {
                return;
            }
            
            var temp = this.getBoardStatus(pos);
            var turn = temp[0];
            var status = this.board_status[pos];
            console.log('Change Before: pos:' + pos + ' turn:' + turn +
                       ' status:' + status);
            if (turn == this.BLACK) {
                if (status < this.PROMOTE_THRESHOLD) {
                    if (status != this.piece_kind['KI'] && 
                        status != this.piece_kind['OU']) {
                        status += this.PROMOTE_PLUS;
                    } else {
                        turn = this.WHITE;
                    }
                } else {
                    turn = this.WHITE;
                    status -= this.PROMOTE_PLUS;
                }
                this.setBoardStatus(pos, turn, status);
            } else if (turn == this.WHITE) {
                if (status < (this.PROMOTE_THRESHOLD | this.WHITE_BIT)) {
                    if ((status & (~this.WHITE_BIT)) != this.piece_kind['KI'] && 
                        (status & (~this.WHITE_BIT)) != this.piece_kind['OU']) {
                        status += this.PROMOTE_PLUS;
                    } else {
                        turn = this.BLACK;
                        status &= ~this.WHITE_BIT;
                    }
                } else {
                    turn = this.BLACK;
                    status &= ~this.WHITE_BIT;
                    status -= this.PROMOTE_PLUS;
                }
                this.setBoardStatus(pos, turn, status);
            }
            console.log('Change After: pos:' + pos + ' turn:' + turn +
                       ' status:' + status);
        },
        getSFENString: function(turn) {
            var sfen = '';
            for (var row = 1; row <= 9; row++) {
                var empty_num = 0;
                for (var col = 9; col >= 1; col-- ) {
                    var pos = col * 10 + row;
                    var status = this.board_status[pos];
                    if (status == 0) {
                        empty_num++;
                    }
                    else {
                        if (empty_num != 0) {
                            sfen += String(empty_num);
                        }

                        if (status & this.WHITE_BIT) {
                            status &= (~this.WHITE_BIT);
                            sfen += this.sfen_name[status];
                        } else {
                            sfen += this.sfen_name[status].toUpperCase();
                        }
                        empty_num = 0;
                    }
                }
                if (empty_num != 0) {
                    sfen += String(empty_num);
                }
                if (row != 9) {
                    sfen += '/';
                }
                empty_num = 0;
            }
            
            if (typeof turn == 'undefined' || turn == this.BLACK) {
                sfen += ' b ';
            } else {
                sfen += ' w ';
            }
            
            var no_hand_piece = true;
            var black_hand_pieces = this.getHandPieces(this.BLACK);
            for (var piece in black_hand_pieces) {
                var num = black_hand_pieces[piece];
                if (num > 0) {
                    no_hand_piece = false;
                    var sfen_name = this.sfen_dict[piece];
                    if (num > 1) {
                        sfen += String(num);
                    }
                    sfen += sfen_name.toUpperCase();
                }
            }

            var white_hand_pieces = this.getHandPieces(this.WHITE);
            for (var piece in white_hand_pieces) {
                var num = white_hand_pieces[piece];
                if (num > 0) {
                    no_hand_piece = false;
                    var sfen_name = this.sfen_dict[piece];
                    if (num > 1) {
                        sfen += String(num);
                    }
                    sfen += sfen_name;
                }
            }

            if (no_hand_piece == true) {
                sfen += '- ';
            }

            /// TODO:move number is now only 1.
            sfen += '1';
            return sfen;
        },
        getBoardString: function() {
            var str = '';
            var white_hand_pieces = this.getHandPieces(this.WHITE);

            str += '後手の持駒：';
            str += this.getHandString(white_hand_pieces);

            str += ' ９ ８ ７ ６ ５ ４ ３ ２ １\n';
            str += '+---------------------------+\n';
            for (var row = 1; row <= 9; row++) {
                str += '|';
                for (var col = 9; col >= 1; col-- ) {
                    var pos = col * 10 + row;
                    var status = this.board_status[pos];

                    if (status & this.WHITE_BIT) {
                        str +='v';
                        status &= (~this.WHITE_BIT);

                        str += this.kanji_name[status];
                    }
                    else if (status != 0){
                        str += ' ';
                        status &= (~this.WHITE_BIT);
                        str += this.kanji_name[status];
                    } else {
                        str += ' ・';
                    }
                }
                str += '|';
                str += this.kanji_num[row] + '\n';
            }
            str += '+---------------------------+\n';

            var black_hand_pieces = this.getHandPieces(this.BLACK);
            str += '先手の持駒：';
            str += this.getHandString(black_hand_pieces);
            return str;
        },
        getHandString: function(hand_pieces) {
            var str = '';
            var hand_piece_added = false;

            for (var i = 0;i < this.hand_piece_order.length; i++) {
                var piece_name = this.hand_piece_order[i];
                var piece_num = hand_pieces[piece_name];
                var piece_kanji_name = this.piece_kanji_dict[piece_name];

                if (piece_num > 0) {
                    hand_piece_added = true;
                    str += piece_kanji_name;
                    if (piece_num > 1) {
                        str += this.kanji_num[piece_num];
                    }
                    str += '　';
                }
            }

            if (hand_piece_added == false) {
                str += 'なし\n';
            } else {
                str += '\n';
            }
            return str;
        }
    };
}

if (!this['BoardCanvas']) {
    var BoardCanvas = function(canvas, shogi_board, 
                               piece_images, number_images) {
        var self = this;
        this.canvas = canvas;
        console.log('canvas textBaseline set:');
        var ctx = this.canvas.getContext('2d');

        this.shogi_board = shogi_board;
        this.piece_images = piece_images;
        this.number_images = number_images;
        this.click_status = { pos:undefined, piece:undefined }; /// Now Click Status

        this.black_hand_pieces_y = {}; 
        this.white_hand_pieces_y = {};

        this.BOARD_X = 50; this.BOARD_Y = 5;
        this.BLACK_X = 360; this.BLACK_Y = 5;
        this.BLACK_MARK_WIDTH = 32; this.BLACK_MARK_HEIGHT = 32;
        this.BOARD_WIDTH_PADDING = 4; this.BOARD_HEIGHT_PADDING = 14;
        this.MULTIPLE_X = 31; this.BOARD_MULTIPLE_Y = 32;
        this.BOARD_MULTIPLE_X = 31; this.BOARD_MULTIPLE_Y = 32;
        this.WHITE_X = 10; this.WHITE_Y = 310;
        this.WHITE_MARK_WIDTH = 32; this.WHITE_MARK_HEIGHT = 32;
        this.SQUARE_ORIGIN_X = 8; this.SQUARE_ORIGIN_Y = 16;
        this.SQUARE_MULTIPLE_X = 31; this.SQUARE_MULTIPLE_Y = 32;
        this.SQUARE_WIDTH = 30; this.SQUARE_HEIGHT = 30;

        this.CANVAS_WIDTH = 400; this.CANVAS_HEIGHT = 420;
        this.PIECE_IMAGE_WIDTH = 24; this.PIECE_IMAGE_HEIGHT = 24;
        this.IMAGE_PADDING_X = 4; this.IMAGE_PADDING_Y = 4;
        this.NUMBER_IMAGE_WIDTH = 12; this.NUMBER_IMAGE_HEIGHT = 12;
        this.TITLE_HEIGHT = 50;
        this.onMouseOver = function(evt) {
            return '';
        };
        this.onMouseMove = function(evt) {
            return '';
        };
        this.onClick = function(evt) {
            var temp;
            var ctx = self.canvas.getContext('2d');
            console.log('self:' + typeof self);

            temp = self.getPos(evt);
            var x = temp[0];
            var y = temp[1];

            console.log('Click: x:' + x + ' y:' + y);
            temp = this.convertPositionToBoard(x, y);
            var pos = temp.join('');
            var pos_x = temp[0];
            var pos_y = temp[1];
            console.log('pos_x:' + pos_x + ' pos_y:' + pos_y);

            /// クリックした場所が範囲外だった場合は何もしない
            /// pos_x が -1の時は後手の駒台、10の時は先手の駒台とみなす
            /// TODO:pos_y が9以上の場合、駒箱とみなす
            if (pos_y < 1 || pos_y > 9) {
                return;
            }
            if (pos_x < 1) {
                pos = 0;
            } else if (pos_x > 9) {
                pos = 1;
            }
            
            var click_status = self.click_status.pos;
            console.log('click_status:' + click_status);

            if (typeof click_status == 'undefined') {
                /// if nothing is selected.
                if (pos_x >= 1 && pos_x <= 9) {
                    var status = self.shogi_board.getBoardStatus(pos);
                    console.log('pos:' + pos + ' status:' + status[0]);
                    if (status[0] != self.shogi_board.EMPTY) {
                        /// 全書き全消し
                        console.log('width: ' + self.canvas.width +
                                    ' height: ' + self.canvas.height);
                        self.drawSquareOnBoard(pos_x, pos_y);
                        self.drawAll();

                        self.click_status.pos = pos;
                        console.log('pos:' + self.click_status.pos);
                    }
                } else if (pos_x > 9) { 
                    /// Clicked White Piece Stand
                    /// Detect which hand piece is selected.
                    var selected_y = 0;
                    var selected_piece = undefined;
                    for (var piece in self.white_hand_pieces_y) {
                        if (y > self.white_hand_pieces_y[piece] && 
                            y < (self.white_hand_pieces_y[piece] +
                                 self.PIECE_IMAGE_HEIGHT) ) {
                            selected_piece = piece;
                            selected_y = self.white_hand_pieces_y[piece];
                        }
                    }

                    if (selected_y != 0 && typeof selected_piece != 'undefined') {
                        self.drawSquare(self.WHITE_X, selected_y);
                        self.drawAll();

                        self.click_status.pos = self.shogi_board.WHITE;
                        self.click_status.piece = selected_piece;
                    }
                    
                    console.log('white piece stand clicked.');
                    console.log('selected_y:' + selected_y + 
                                ' seleceted_piece:' + selected_piece);
                } else if (pos_x < 1) {
                   /// Clicked Black Piece Stand
                   /// Detect which hand piece is selected.
                    var selected_y = 0;
                    var selected_piece = undefined;
                    for (var piece in self.black_hand_pieces_y) {
                        if (y > self.black_hand_pieces_y[piece] &&
                            y < (self.black_hand_pieces_y[piece] + 
                                 self.PIECE_IMAGE_HEIGHT)) {
                            selected_piece = piece;
                            selected_y = self.black_hand_pieces_y[piece];
                        }
                    }

                    if (selected_y != 0 && typeof selected_piece != 'undefined') {
                        console.log('black hand piece clicked.');
                        self.drawSquare(self.BLACK_X, selected_y);
                        self.drawAll();

                        self.click_status.pos = self.shogi_board.BLACK;
                        self.click_status.piece = selected_piece;
                    }

                    console.log('black piece stand clicked.');
                    console.log('selected_y:' + selected_y + 
                                ' seleceted_piece:' + selected_piece);
                }
            } else if (click_status > 10 && click_status < 100) {
                /// if already selected any square.
                console.log('click_status:' + click_status + ' -> ' + pos);
                self.shogi_board.swapBoardPieces(click_status, pos);
                self.removeSquare();

                self.drawAll();
                self.click_status.pos = undefined;
                self.click_status.piece = undefined;
            } else if (click_status < 10) {
                if (pos < 10) {
                    var piece_name = self.click_status.piece;
                    if (pos == 0 && click_status == self.shogi_board.WHITE) {
                        self.shogi_board.givePieceFromStand(self.shogi_board.WHITE, piece_name);
                    } else if (pos == 1 && click_status == self.shogi_board.BLACK) {
                        self.shogi_board.givePieceFromStand(self.shogi_board.BLACK, piece_name);
                    }
                    
                    self.removeSquare();
                    self.drawAll();

                    self.click_status.pos = undefined;
                    self.click_status.piece = undefined;
                } else {
                    var from_pos = self.click_status.pos;
                    var piece_name = self.click_status.piece;
                    var to_pos = temp.join('');
                    var to_pos_status = self.shogi_board.getBoardStatus(to_pos);

                    console.log('to_pos_status:' + to_pos + ':' + to_pos_status[0]);

                    if (to_pos_status[0] == self.shogi_board.EMPTY) {
                        self.shogi_board.dropPieceFromStand(from_pos, piece_name, to_pos);
                        self.removeSquare();
                        self.drawAll();

                        self.click_status.pos = undefined;
                        self.click_status.piece = undefined;
                    }
                }
            }
        };

        this.select_square_x = undefined;
        this.select_square_y = undefined;
        this.drawSquare = function(x, y) {
            console.log('drawSquare: x:' + x + ' y:' + y);
            var ctx = this.canvas.getContext('2d');
            ctx.fillStyle = "rgb(255, 255, 192)";
            ctx.fillRect(x, y, this.SQUARE_WIDTH, this.SQUARE_HEIGHT);

            this.select_square_x = x;
            this.select_square_y = y;
        };
        this.drawSquareOnBoard = function (pos_x, pos_y) {
            console.log('drawSquareOnBoard: ' + pos_x + '' + pos_y);
            var ctx = self.canvas.getContext('2d');
            /// 黄色のマスを書く
            ctx.fillStyle = "rgb(255, 255, 192)";
            
            var origin_x = self.BOARD_X + self.BOARD_WIDTH_PADDING;
            var origin_y = self.BOARD_Y + self.TITLE_HEIGHT + self.BOARD_HEIGHT_PADDING;
            console.log('fillRect:(' + (origin_x + (9 - pos_x) * self.SQUARE_MULTIPLE_X) + ',' + (origin_y + (pos_y - 1) * self.SQUARE_MULTIPLE_Y) + ',' +  self.SQUARE_MULTIPLE_X + ',' + self.SQUARE_MULTIPLE_Y + ')');

            var x = origin_x + (9 - pos_x) * self.SQUARE_MULTIPLE_X;
            var y = origin_y + (pos_y - 1) * self.SQUARE_MULTIPLE_Y;

            ctx.fillRect(x, y,
                         self.SQUARE_WIDTH, self.SQUARE_HEIGHT);
            console.log('fillRect: pos_x:' + pos_x + ' pos_y:' + pos_y);

            self.select_square_x = x;
            self.select_square_y = y;
        };

        this.removeSquare = function() {
            self.select_square_x = undefined;
            self.select_square_y = undefined;
        };

        this.onDoubleClick = function(evt) {
            var temp  = this.getPos(evt);
            var x = temp[0];
            var y = temp[1];
            temp = this.convertPositionToBoard(x, y);
            var pos_x = temp[0];
            var pos_y = temp[1];

            var pos = temp.join('');
            console.log('DoubleClick: pos_x:' + pos_x + ' y:' + pos_y);
            self.shogi_board.changePieceKind(pos);
            self.removeSquare();

            self.drawAll();
        };

        this.drawPieces = function() {
            console.log('drawPieces width:' + self.canvas.width + 
                        ' height:' + self.canvas.height );
            var ctx = self.canvas.getContext('2d');
            var image;
            image = self.piece_images.getBoardImage();
            console.log('x: ' + self.BOARD_X + 
                        ' y:' + (self.BOARD_Y + self.TITLE_HEIGHT) + ' image:' + typeof image);
            ctx.drawImage(image, self.BOARD_X, self.BOARD_Y + self.TITLE_HEIGHT);

            image = self.piece_images.getBlackImage();
            ctx.drawImage(image, self.BLACK_X, self.BLACK_Y + self.TITLE_HEIGHT);

            image = self.piece_images.getWhiteImage();
            self.drawRotateImage(image, self.WHITE_X, self.WHITE_Y + self.TITLE_HEIGHT);

            var pieces = self.shogi_board.getAllPieces();
            for(var i = 0;i < pieces.length; i++) {
                var pos = pieces[i][0];
                var turn = pieces[i][1][0];
                var piece = pieces[i][1][1];
                console.log('pos:' + pos + 
                            ' turn:' + turn + 
                            ' piece:' + piece);
                
                var x = self.BOARD_X + self.SQUARE_ORIGIN_X + 
                        self.SQUARE_MULTIPLE_X * (9 - parseInt(pos / 10));
                var y = self.BOARD_Y + self.TITLE_HEIGHT + self.SQUARE_ORIGIN_Y + 
                        self.SQUARE_MULTIPLE_Y * ((pos % 10) - 1);
                
                image = self.piece_images.getBoardImage();

                if (turn == self.shogi_board.BLACK) {
                    image = self.piece_images.getImage(piece);
                    ctx.drawImage(image, x, y);
                } else if (turn == self.shogi_board.WHITE) {
                    image = self.piece_images.getImage(piece);
                    self.drawRotateImage(image, x, y);
                }

            }

            /// Draw Hand Pieces
            /// Draw Black Hand Pieces
            console.log('Draw Black Hand Pieces:');
            pieces = self.shogi_board.getHandPieces(self.shogi_board.BLACK);
            self.black_hand_pieces_y = {};

            var piece_order = self.shogi_board.hand_piece_order;
            var y = self.BLACK_Y + self.TITLE_HEIGHT + self.BLACK_MARK_HEIGHT ;
            for (var i = 0;i < piece_order.length; i++) {
                var x = self.BLACK_X;
                var piece_name = piece_order[i];
                var piece_num = pieces[piece_name];
                console.log('piece_name:' + piece_name + 
                            ' piece_num:' + piece_num);

                if (piece_num > 0) {
                    image = self.piece_images.getImage(piece_name);
                    ctx.drawImage(image, x, y);
                    self.black_hand_pieces_y[piece_name] = y;

                    y += self.PIECE_IMAGE_HEIGHT + self.IMAGE_PADDING_Y;

                    /// 数字の描画
                    if (piece_num > 1) {
                        var num;
                        if (piece_num >= 10) {
                            // 2桁目を描画
                            num = parseInt(piece_num / 10);
                            image = self.number_images.getImage(num);
                            ctx.drawImage(image, x, y);
                        }
                        x += self.NUMBER_IMAGE_WIDTH;
                        num = piece_num % 10;
                        image = self.number_images.getImage(num);

                        console.log('image:' + typeof image + ' x:' + x +
                                   ' y:' + y);

                        ctx.drawImage(image, x, y);
                        y += self.NUMBER_IMAGE_HEIGHT + self.IMAGE_PADDING_Y;
                    }
                }
            }

            console.log('Draw White Hand Pieces:');
            /// Draw White Hand Pieces
            pieces = self.shogi_board.getHandPieces(self.shogi_board.WHITE);
            y = self.WHITE_Y + self.TITLE_HEIGHT;
            self.white_hand_pieces_y = {};

            var first_draw = true;
            for (var i = 0; i < piece_order.length; i++) {
                var x = self.WHITE_X;
                var piece_name = piece_order[i];
                var piece_num = pieces[piece_name];
                console.log('piece_name:' + piece_name + 
                            ' piece_num:' + piece_num);
                
                if (piece_num > 0) {
                    image = self.piece_images.getImage(piece_name);
                    if (first_draw == true) {
                        y -= self.WHITE_MARK_HEIGHT;
                        first_draw = false;
                    } else {
                        y -= (self.PIECE_IMAGE_HEIGHT + self.IMAGE_PADDING_Y);
                    }
                    self.drawRotateImage(image, x, y);
                    self.white_hand_pieces_y[piece_name] = y;

                    if (piece_num > 1) {
                        y -= (self.NUMBER_IMAGE_HEIGHT + self.IMAGE_PADDING_Y);
                        console.log('piece_num:' + piece_num);
                        var num;
                        num = piece_num % 10;
                        image = self.number_images.getImage(num);
                        self.drawRotateImage(image, x, y);

                        x += self.NUMBER_IMAGE_WIDTH;
                        if (piece_num >= 10) {
                            num = parseInt(piece_num / 10);
                            image = self.number_images.getImage(num);
                            self.drawRotateImage(image, x, y);
                        }
                    }
                }
            }
        };

        this.drawRotateImage = function(image, x, y) {
            console.log('drawRotateImage(' + image + ',' + x + ',' + y + ')');
            var ctx = self.canvas.getContext('2d');
            ctx.save();
            ctx.translate(x * 2 + image.width, y * 2 + image.height);
            ctx.rotate(Math.PI);
            ctx.drawImage(image, x, y);

            ctx.restore();
            
        };

        this.convertPositionToBoard = function(x, y) {
            console.log('convertPositionToBoard(' + x + ', ' + y + ') called:');
            var pos_x = x;
            var pos_y = y;
            console.log('pos_x:' + pos_x);
            pos_x =  pos_x - self.BOARD_X - self.BOARD_WIDTH_PADDING;
            console.log('pos_x:' + pos_x);
            pos_x = pos_x / self.BOARD_MULTIPLE_X;
            console.log('pos_x:' + pos_x);
            if (pos_x < 0) {
                pos_x = 10;
            } else {
                pos_x = 9 - parseInt(pos_x);
            }
            console.log('pos_x:' + pos_x);

            console.log('pos_y:' + pos_y);
            pos_y = pos_y - self.BOARD_Y - self.BOARD_HEIGHT_PADDING - self.TITLE_HEIGHT;
            console.log('pos_y:' + pos_y);
            pos_y = pos_y / self.BOARD_MULTIPLE_Y;
            console.log('pos_y:' + pos_y);
            if (pos_y < 0) {
                pos_y = 0;
            } else {
                pos_y = parseInt(pos_y) + 1;
            }
            console.log('pos_y:' + pos_y);

            console.log('convertPositionToBoard:x' + x + ' y:' + y + 
                        ' pos_x:' + pos_x + ' pos_y:' + pos_y);
            return [pos_x, pos_y];
        };

        this.getPos = function(evt) {
            // Get Position of inside canvas
            // Reference: http://docs.jquery.com/Tutorials:Mouse_Position
            // Reference: http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
            console.log('getPos() Called:');
	    var pos_x = 0;
	    var pos_y = 0;

            if (!evt) {
                evt = windows.evt;
            }

            if (evt.pageX || evt.pageY) { 
                pos_x = evt.pageX;
                pos_y = evt.pageY;
            }
            else { 
                pos_x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
                pos_y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
            } 

            console.log('pos_x:' + pos_x + ' pos_y:' + pos_y);

            pos_x -= self.canvas.offsetLeft;
            pos_y -= self.canvas.offsetTop;              

            console.log('pos_x:' + pos_x + ' pos_y:' + pos_y);

            return [pos_x, pos_y];
        };

        this.TITLE_MARK_WIDTH = 16;
        this.TITLE_MARK_HEIGHT = 16;
        this.WHITE_TITLE_MARK_X = 5;
        this.PLAYER_Y = 5;
        this.TITLE_Y = 30,
        this.black_name = '';
        this.white_name = '';
        this.title = '';

        this.drawBlackName = function(black_name) {
            var ctx = self.canvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.font = '16px sans-serif';
            ctx.textBaseline = 'top';

            console.log('font:' + ctx.font + ' baseline:' + ctx.textBaseline );

            if (black_name != '') {
                // 黒のマークを書く
                var draw_black_name = black_name;
                if (typeof black_name == 'undefined') {
                    // 今保持されている先手名を書く(または消す)
                    draw_black_name = self.black_name;
                } else {
                    /// for fillText
                    draw_black_name = black_name.replace(/\s/g, '\u0020');
                }
                if (draw_black_name.match(/^(\s|\u0020)*$/)) {
                    return;
                }
                console.log('draw_black_name:' + draw_black_name);

                var black_name_width = ctx.measureText(draw_black_name);
                var clear_black_name_width = ctx.measureText(self.black_name);

                console.log('black_name_width:' + black_name_width.width + 
                            ' HEIGHT:' + self.TITLE_MARK_HEIGHT);
                console.log('clear_black_name_width:' + clear_black_name_width.width);

                var black_image = self.piece_images.getBlackImage();
                var black_title_x_left = self.CANVAS_WIDTH - (black_name_width.width + 
                                                             self.TITLE_MARK_WIDTH +
                                                             self.IMAGE_PADDING_X);
                var clear_black_title_x_left = self.CANVAS_WIDTH - 
                        (clear_black_name_width.width + 
                         self.TITLE_MARK_WIDTH + 
                         self.IMAGE_PADDING_X);

                var black_title_x = black_title_x_left + self.IMAGE_PADDING_X;
                ctx.drawImage(black_image, black_title_x, self.PLAYER_Y,
                             self.TITLE_MARK_WIDTH, self.TITLE_MARK_HEIGHT);
                black_title_x += self.TITLE_MARK_WIDTH;
                ctx.fillText(draw_black_name, black_title_x, self.PLAYER_Y,
                            self.NAME_IMAGE_WIDTH);
                self.black_name = draw_black_name;
            }
        };
        
        this.drawWhiteName = function(white_name) {
            var ctx = self.canvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.font = '16px sans-serif';
            ctx.textBaseline = 'top';

            if (white_name != '') {
                var draw_white_name;
                if (typeof white_name == 'undefined') {
                    // 今保持されている後手名を書く
                    draw_white_name = self.white_name;
                } else {
                    /// for fillText
                    draw_white_name = white_name.replace(/\s/g, '\u0020');
                }
                if (draw_white_name.match(/^(\s|\u0020)*$/)) {
                    return;
                }
                console.log('draw_white_name:' + draw_white_name);

                var white_name_width  = ctx.measureText(draw_white_name);
                var clear_white_name_width = ctx.measureText(self.white_name);

                console.log('white_name_width:' + white_name_width.width + 
                            ' HEIGHT:' + self.TITLE_MARK_HEIGHT);

                // 白のマークを書く
                var white_image = self.piece_images.getWhiteImage(Math.PI);
                var white_title_x = self.WHITE_TITLE_MARK_X;

                ctx.drawImage(white_image, white_title_x, self.PLAYER_Y,
                              self.TITLE_MARK_WIDTH, self.TITLE_MARK_HEIGHT);
                white_title_x += self.TITLE_MARK_WIDTH + self.IMAGE_PADDING_X;
                ctx.fillText(draw_white_name, white_title_x, self.PLAYER_Y);

                self.white_name = draw_white_name;
            } 
        };

        this.drawTitle = function(title) {
            var ctx = self.canvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.font = '16px sans-serif';
            ctx.textBaseline = 'top';


            ctx.clearRect(0, self.TITLE_Y, self.canvas.width, self.TITLE_HEIGHT);

            var title_name_width  = ctx.measureText(title);
            console.log('title_name_width:' + title_name_width.width + 
                        ' HEIGHT:' + self.TITLE_MARK_HEIGHT);
            console.log('draw_title');

            if (title != '') {
                var draw_title;
                if (typeof title == 'undefined') {
                    // 今保持されているタイトルを書く
                    draw_title = self.title;
                } else {
                    draw_title = title.replace(/\s/g, '\u0020');
                }

                // 書く文字の長さに応じて中央を求める
                var center = parseInt(self.CANVAS_WIDTH / 2);
                var title_width = ctx.measureText(draw_title);
                var center_x = center - parseInt(title_width.width / 2);
                ctx.fillText(draw_title, center_x, self.TITLE_Y);

                self.title = draw_title;
            } 
        };

        this.getTitle = function() {
            return self.title.replace(/\u0020/g, ' ');
        };
        
        this.getBlackName = function() {
            return self.black_name.replace(/\u0020/g, ' ');
        };

        this.getWhiteName = function() {
            return self.white_name.replace(/\u0020/g, ' ');
        };
        
        this.clearAll = function() {
            var ctx = self.canvas.getContext('2d');
            ctx.clearRect(0, 0, 
                          this.canvas.width, 
                          this.canvas.height);
        };
        
        this.drawHeader = function() {
            self.drawBlackName();
            self.drawWhiteName();
            self.drawTitle();
        };

        this.drawAll = function() {
            self.clearAll();
            self.drawBlackName();
            self.drawWhiteName();
            self.drawTitle();
            if (typeof self.select_square_x != 'undefined') {
                console.log('Square x:' + self.select_square_x + 
                            ' y:' + self.select_square_y);
                self.drawSquare(self.select_square_x, self.select_square_y);
            }
            self.drawPieces();

            self.onBoardChange();
        };

        this.onBoardChange = function() {
        };
    };
}

if (!this['PieceImages']) {
    var PieceImages = function () {
        this.board_image = '';
        this.black_image = '';
        this.white_image = '';
        this.piece_images = {};

        this.board_url = '';
        this.black_url = '';
        this.white_url = '';
        this.piece_urls = {};

        this.callback = {};
        this.num_loaded = 0;
    };

    PieceImages.prototype = {
        ALL_IMAGE_NUM:17,
        initImages: function (on_complete_callback, kind) {
            this.callback = on_complete_callback;
            this.board_url = PATH + 'static_img/board.png';
            var suffix = '';

            if (typeof kind != 'undefined' || kind != 'kanji') {
                if (kind == 'alphabet' || kind == 'international') {
                    this.board_url = PATH + 'static_img/board_alphabet.png';
                    suffix = '_' + kind;
                }
            }

            this.black_url = PATH + 'static_img/black.png';
            this.white_url = PATH + 'static_img/white.png';
            this.piece_urls['FU'] = PATH + 'static_img/fu' + suffix + '.png';
            this.piece_urls['KY'] = PATH + 'static_img/ky' + suffix + '.png';
            this.piece_urls['KE'] = PATH + 'static_img/ke' + suffix + '.png';
            this.piece_urls['GI'] = PATH + 'static_img/gi' + suffix + '.png';
            this.piece_urls['KI'] = PATH + 'static_img/ki' + suffix + '.png';
            this.piece_urls['HI'] = PATH + 'static_img/hi' + suffix + '.png';
            this.piece_urls['KA'] = PATH + 'static_img/ka' + suffix + '.png';
            this.piece_urls['OU'] = PATH + 'static_img/ou' + suffix + '.png';
            this.piece_urls['TO'] = PATH + 'static_img/to' + suffix + '.png';
            this.piece_urls['NY'] = PATH + 'static_img/ny' + suffix + '.png';
            this.piece_urls['NK'] = PATH + 'static_img/nk' + suffix + '.png';
            this.piece_urls['NG'] = PATH + 'static_img/ng' + suffix + '.png';
            this.piece_urls['UM'] = PATH + 'static_img/um' + suffix + '.png';
            this.piece_urls['RY'] = PATH + 'static_img/ry' + suffix + '.png';
            

            this.board_image = 
                    this.loadFromFile(this.board_url);
            this.black_image = 
                    this.loadFromFile(this.black_url);
            this.white_image = 
                    this.loadFromFile(this.white_url);
            
            this.piece_images['FU'] = 
                    this.loadFromFile(this.piece_urls['FU']);
            this.piece_images['KY'] = 
                    this.loadFromFile(this.piece_urls['KY']);
            this.piece_images['KE'] = 
                    this.loadFromFile(this.piece_urls['KE']);
            this.piece_images['GI'] = 
                    this.loadFromFile(this.piece_urls['GI']);
            this.piece_images['KI'] = 
                    this.loadFromFile(this.piece_urls['KI']);
            this.piece_images['HI'] = 
                    this.loadFromFile(this.piece_urls['HI']);
            this.piece_images['KA'] = 
                    this.loadFromFile(this.piece_urls['KA']);
            this.piece_images['OU'] = 
                    this.loadFromFile(this.piece_urls['OU']);
            this.piece_images['TO'] = 
                    this.loadFromFile(this.piece_urls['TO']);
            this.piece_images['NY'] = 
                    this.loadFromFile(this.piece_urls['NY']);
            this.piece_images['NK'] = 
                    this.loadFromFile(this.piece_urls['NK']);
            this.piece_images['NG'] = 
                    this.loadFromFile(this.piece_urls['NG']);
            this.piece_images['UM'] = 
                    this.loadFromFile(this.piece_urls['UM']);
            this.piece_images['RY'] = 
                    this.loadFromFile(this.piece_urls['RY']);
        },
        onLoad: function() {
            this.piece_images.num_loaded++;
            console.log('Loaded:' + this.piece_images.num_loaded);
            if (this.piece_images.num_loaded == this.piece_images.ALL_IMAGE_NUM) {
                console.log('callback:' + typeof this.piece_images.callback);
                if (typeof this.piece_images.callback == 'function') {
                    this.piece_images.callback();
                }
                this.piece_images.num_loaded = 0;
            }
        },
        loadFromFile : function (filename) {
            console.log('Load from File:' + filename);
            var image = new Image();
            image.onload = PieceImages.prototype.onLoad;
            image.piece_images = this;
            image.src = filename;
            return image;
        },
        getImage: function(name) {
            console.log('name:' + name);
            name = name.toUpperCase();
            return this.piece_images[name];
        },
        getBoardUrl: function() {
            return this.board_url;
        },
        getBlackUrl: function() {
            return this.black_url;
        },
        getWhiteUrl: function() {
            return this.white_url;
        },
        getImageUrl: function(name) {
            return this.piece_urls[name];
        },
        getBoardImage: function() {
            return this.board_image;
        },
        getBlackImage: function() {
            return this.black_image;
        },
        getWhiteImage: function() {
            return this.white_image;
        }
    };
}

if (!this['NumberImages']) {
    var NumberImages = function() {
        this.callback = undefined;
        this.num_loaded = 0;
        this.is_loaded = false;
        this.num_image = {};

    };

    NumberImages.prototype = {
        ALL_IMAGE_NUM:10,
        initImages: function(on_complete_callback) {
            this.callback = on_complete_callback;

            for (var i = 0;i < 10; i++) {
                this.num_image[i] = this.loadFromFile(PATH + 'static_img/' + 
                                                      i + '.png');
            }
        },
        onLoad: function(filename) {
            this.number_images.num_loaded++;
            if (this.number_images.num_loaded == this.number_images.ALL_IMAGE_NUM) {
                if (typeof this.number_images.callback == 'function') {
                    this.number_images.callback();
                }
                this.number_images.num_loaded = 0;
                this.number_images.is_loaded = false;
            }
        },
        loadFromFile: function(filename) {
            console.log('Load from File:' + filename);
            var image = new Image();
            image.onload = NumberImages.prototype.onLoad;
            image.number_images = this;
            image.src = filename;
            return image;
        },
        getImage: function (num) {
            return this.num_image[num];
        }
    };
}
