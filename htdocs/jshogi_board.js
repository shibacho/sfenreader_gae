// -*- coding: utf-8 -*-
//
// jshogi_board.js Copyright 2011-2016 shibacho
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

var PATH = 'http://' + location.host + Pathname(location.pathname) + '/';
var IMAGEPATH = PATH + '../static_img/';

function Pathname(path) {
  console.log('Pathname() path:' + path);
  var index = path.lastIndexOf('/');
  if (index === -1) {
    return path;
  }
  return path.substring(0, index);
}

/**
 * Check SFEN string
 * 
 * @param {string} sfen - The string of SFEN.
 * @return {boolean} sfen is true or false.
 */
function IsValidSfen(sfen) {
  console.log('IsValidSfen(' + sfen + ') is called.');
  var sfen_array = sfen.split(' ');
  if (sfen_array.length !== 4) {
    console.debug('Length of SFEN string token is invalid. Must be 4, this is ' + sfen_array.length + '.');
    return false;
  }
  // Check if turn is valid
  if (sfen_array.length > 1 && sfen_array[1] !== 'b' && sfen_array[1] !== 'w') {
    console.debug('A turn is invalid. (Must be \'b\' or \'w\')')
    return false;
  }
  var sfen_board = sfen_array[0];
  var sfen_hand  = sfen_array[2];

  var sfen_rows = sfen_board.split('/');
  // Check if the SFEN string of board status have exact 9 columns.
  if (sfen_rows.length !== 9) {
    console.debug('Number of shogi board row is invalid. (' + sfen_board.split('/').length + ')');
    return false;
  }

  // Each row must be less or equal from 9.
  for (var i = 0, n = sfen_rows.length; i < n; i++) {
    var sfen_row = sfen_rows[i];
    var count = 0; // square count
    var num_regexp = /[1-9]/;
    for (var index = 0, index_max = sfen_row.length; index < index_max; index++) {
      var c = sfen_row.charAt(index);
      if (c.match(num_regexp)) {
        count += parseInt(c);
      } else if (c !== '+') { // prefix of promotied piece 
        count++;
      }
    }

    if (count > 9) {
      console.debug('Too much pieces in one row. (' + sfen_row + ')');
      return false;
    }
  }

  // Check if the SFEN string of the hand have only valid shogi pieces.
  if (!sfen_board.match(/[krbgsnlp\/]+/i)) {
    console.debug('Board piece character(s) is invalid.');
    return false;
  };
  if (!sfen_hand.match(/[1-9krbgsnlp\-]+/i)) {
    console.debug('Hand piece character(s) is invalid.');
    return false;   
  }
  console.log('Valid.');
  return true;
}

if (typeof window.console !== 'object') { // for IE
  window.console = {
    log:function(){}
  };
}

// ShogiBoard definition starts
/** 
 * Represents shogi board status
 * @constructor
 */
function ShogiBoard() {
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
  this.sfen_dict_rev = { 'p':'FU',  'l':'KY',  'n':'KE',  's':'GI',
                         'g':'KI',  'b':'KA',  'r':'HI',  'k':'OU',
                        '+p':'TO', '+l':'NY', '+n':'NK', '+s':'NG',
                        '+g':'NA', '+b':'UM', '+r':'RY' };
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

  for (var i = 0; i < this.hand_piece_order.length; i++) {
      this.black_hand_pieces[this.hand_piece_order[i]] = 0;
      this.white_hand_pieces[this.hand_piece_order[i]] = 0;
  }
  /** For empty square */ 
  this.EMPTY = 0;
  /** No Turn */
  this.NOTURN = 0;
  /** Sente */
  this.BLACK = 1;
  /** Gote  */ 
  this.WHITE = 2;
  this.board_turn = this.NOTURN;

  this.WHITE_BIT = 0x10;
  
  /** piece enum */
  this.FU = 1;
  this.KY = 2;
  this.KE = 3;
  this.GI = 4;
  this.KI = 5;
  this.KA = 6;
  this.HI = 7;
  this.OU = 8;
  this.TO = 9;
  this.NY = 10;
  this.NK = 11;
  this.NG = 12;
  this.NA = 13;
  this.UM = 14;
  this.RY = 15;
  this.PROMOTE_THRESHOLD = 9;
  this.PROMOTE_PLUS = 8;
}

/**
 * Initialize board status to beginning
 * 
 * @this {ShogiBoard}
 */
ShogiBoard.prototype.initEvenGame = function() {
  this.setBoardStatusBySfen('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1');
};

/**
 * Get piece name from status number
 * 
 * @this {ShogiBoard}
 * @param {number} status - number of representing piece number
 */
ShogiBoard.prototype.getPieceNameFromStatus = function(status) {
    status &= (~this.WHITE_BIT);
    return this.piece_name[status];
};

/**
 * Get board status of specific position
 * 
 * @this {ShogiBoard}
 * @param {number} pos - The specified position of shogi board 
 */
ShogiBoard.prototype.getBoardStatus = function(pos) {
  var status = this.board_status[pos];
  if (status === 0) {
    return [this.EMPTY, this.getPieceNameFromStatus(status)];
  }
  else if (status & this.WHITE_BIT) {
    return [this.WHITE, this.getPieceNameFromStatus(status)];
  } else {
    return [this.BLACK, this.getPieceNameFromStatus(status)];
  }
};

/**
 * Get Piece turn of specific position
 * 
 * @this {ShogiBoard}
 * @param {number} pos - The specified position of shogi board
 */
ShogiBoard.prototype.getSquarePieceTurn = function(pos) {
  if (this.board_status[pos] === 0){
    return this.EMPTY;
  } else if (this.board_status[pos] & this.WHITE_BIT) {
    return this.WHITE;
  } else {
    return this.BLACK;
  }
};

/**
 * Set board status of specific position
 * 
 * @this {ShogiBoard}
 * @param {number} pos - The specified position of shogi board
 * @param {enum} turn - piece turn (this.BLACK or this.WHITE)
 * @param {number} piece - kind of piece (Refer to this.piece_kind)
 */
ShogiBoard.prototype.setBoardStatus = function(pos, turn, piece) {
  if (turn === this.BLACK) {
    this.board_status[pos] = piece;
  } else {
    this.board_status[pos] = (piece | this.WHITE_BIT);
  }
};

/**
 * Set board status of specific position (use piece name)
 * 
 * @this {ShogiBoard}
 * @param {number} pos - The specified position of shogi board
 * @param {enum} turn - piece turn (this.BLACK or this.WHITE)
 * @param {string} piece_name - name of piece (Refer to this.piece_name)
 */
ShogiBoard.prototype.setBoardStatusByString = function(pos, turn, piece_name) {
  var piece = this.piece_kind[piece_name];
  if (piece === undefined) {
    return false;
  }
  this.setBoardStatus(pos, turn, piece);
  return true;
};

/**
 * Set shogi board status by the SFEN string
 * 
 * @this {ShogiBoard}
 * @param {string} sfen - SFEN string
 * @return {boolean} To set board status is successful or not.
 */
ShogiBoard.prototype.setBoardStatusBySfen = function(sfen) {
  console.info('Called setBoardStatusBySfen(' + sfen + ')');
  if (!IsValidSfen(sfen)) {
    return false;
  }
  var sfen_array = sfen.split(' ');
  var sfen_board = sfen_array[0];
  var sfen_hand  = sfen_array[2];
  
  // Update board status
  var sfen_row = sfen_board.split('/');
  var num_regexp = /[1-9]/;
  for (var row = 0, row_max = sfen_row.length; row < row_max; row++) {
    console.log('row:' + String(row));
    var board_row = sfen_row[row];
    console.log('board_row:' + board_row + ' row:' + row);
    for (var i = 0, n = board_row.length, col = 1; i < n; i++, col++) {
      var c = board_row.charAt(i);
      var pos = 10 * (10 - col) + (row + 1);
      if (c.match(num_regexp)) { // number (clear square)
        var num = parseInt(c);
        for (var j = 0; j < num; j++) {
          console.debug('board_status:[' + pos + '] = 0');
          this.board_status[pos] = 0;
          pos -= 10;
        }
        col += num - 1;
        continue;
      } else if (c === '+') { // promoted piece
        c += board_row.charAt(i + 1);
        i++;
        console.log('c:' + c + ' is the promoted piece.')
      }
      var piece_name = this.sfen_dict_rev[c.toLowerCase()];
      var turn = this.BLACK;
      if (c === c.toLowerCase()) {
        turn = this.WHITE;
      }
      console.debug('piece_name:' + piece_name + ' c:' + c + ' board_status:[' + pos + '] = ' + piece_name);
      this.setBoardStatusByString(pos, turn, piece_name);
    }
  }
  
  // Update hand pieces
  this.clearHandPiece(this.BLACK);
  this.clearHandPiece(this.WHITE);
  var prev_sfen = '';
  var piece_num = 1;
  for (var i = 0, n = sfen_hand.length; i < n; i++) {
    var sfen = sfen_hand.charAt(i);
    if (sfen === '-') {
      break;
    }
    if (sfen.match(num_regexp)) { // number
      piece_num = sfen;
      if (i !== n - 1 && sfen_hand.charAt(i + 1).match(num_regexp)) {
        piece_num += sfen_hand.charAt(i + 1);
        i++;
      }
      piece_num = parseInt(piece_num);
    } else { // not number
      var piece_name = this.sfen_dict_rev[sfen.toLowerCase()]
      var piece_kind = this.piece_kind[piece_name];
      if (sfen === sfen.toUpperCase()) { // turn black
        while(piece_num--) {
          this.addHandPiece(this.BLACK, piece_kind);
        }
      } else if (sfen === sfen.toLowerCase()) { // turn white
        while(piece_num--) {
          this.addHandPiece(this.WHITE, piece_kind);
        }
      } else {
        console.error('setBoardStatusBySfen(): In setting hand, unknown piece \"' + piece_name + '\"');
      }
      piece_num = 1;
      // prev_sfen = sfen;
    } // end if number         
  } // end for sfen_hand
  return true;
};

/**
 * Get all pieces on shogi board (except pieces of both hands)
 * 
 * @this {ShogiBoard}
 * @return {array} [[position, kind of pieces]... ]
 */
ShogiBoard.prototype.getAllPieces = function() {
  var pieces = new Array;
  for (var i = 0;i < 100;i++) {
    if (this.board_status[i] !== 0) {
      console.log('i:' + i + ' status:' +
                  this.board_status[i]);
      pieces.push([i, this.getBoardStatus(i) ]);
    }
  }
  return pieces;
};

/**
 * Get hand pieces
 * 
 * @this {ShogiBoard}
 * @param {enum} turn - this.BLACK or this.WHITE
 */
ShogiBoard.prototype.getHandPieces = function(turn) {
  if (turn === this.BLACK) {
    return this.black_hand_pieces;
  } else if (turn === this.WHITE) {
    return this.white_hand_pieces;
  } else {
    return undefined;
  }
};

/**
 * Add pieces to hand
 * 
 * @this {ShogiBoard}
 * @param {enum} turn - turn where want to add (this.BLACK or this.WHITE)
 * @param {piece} piece - piece what add to turn's hand
 */
ShogiBoard.prototype.addHandPiece = function(turn, piece) {
  var hand_piece_array = [];
  piece &= ~this.WHITE_BIT;
  if (piece >= this.PROMOTE_THRESHOLD) {
    piece -= this.PROMOTE_PLUS;
  }
  console.log('addHandPiece(' + turn + ',' + piece + ')');
  if (turn === this.BLACK) {
    hand_piece_array = this.black_hand_pieces;
  } else if (turn === this.WHITE) {
    hand_piece_array = this.white_hand_pieces;
  }
  var piece_name = this.getPieceNameFromStatus(piece);
  var piece_num = hand_piece_array[piece_name];
  if (typeof piece_num === 'undefined') {
    piece_num = 1;
  } else {
    piece_num ++;
  }

  console.log('turn:' + (turn === this.BLACK ? 'BLACK' : 'WHITE'));
  hand_piece_array[piece_name] = piece_num;
  console.log('piece_name:' + piece_name + ':' + piece_num);
};

/**
 * Clear hand pieces
 * 
 * @this {ShogiBoard}
 * @param {enum} turn - this.BLACK or this.WHITE
 */
ShogiBoard.prototype.clearHandPiece = function(turn) {
  console.log('clearHandPiece(' + turn + ')');
  var hand_piece_array = [];
  if (turn === this.BLACK) {
    hand_piece_array = this.black_hand_pieces;
  } else if (turn === this.WHITE) {
    hand_piece_array = this.white_hand_pieces;
  }
  for (var key in hand_piece_array) {
    if (hand_piece_array[key]) {
      hand_piece_array[key] = 0;
    } 
  }
};

/**
 * Swap board pieces `begin` and `end` (maybe hand)
 * 
 * @this {ShogiBoard}
 * @param {number} begin - Swap position from
 * @param {number} end - Swap possition to (0 is black's hand, 1 is white's hand)
 */
ShogiBoard.prototype.swapBoardPieces = function(begin, end) {
  console.log('swapBoardPieces:' + begin + ' -> ' + end);
  console.log('begin_status:' + this.board_status[begin]);
  console.log('end_status:' + this.board_status[end]);

  if (this.board_status[begin] === 0) {
    return;
  }

  if (begin === end) {
    return;
  }

  if (end < 10) { // end is in hand
    var status = this.getBoardStatus(begin);
    if (end === 0) { // Black Piece Stand.
      console.log('addHandPiece to BLACK.');
      this.addHandPiece(this.BLACK, this.board_status[begin]);
    } else if (end === 1) { // White Piece Stand.
      console.log('addHandPiece to WHITE.');
      this.addHandPiece(this.WHITE, this.board_status[begin]);
    }

    this.board_status[begin] = 0;
  } else { // end is on board
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

    if (end_piece !== 0 && begin_turn !== end_turn &&
        end_piece_name !== 'OU') {
      console.log('begin_turn:' + begin_turn +
                  ' end_turn:' + end_turn);
      if (begin_turn !== end_turn) {
          this.addHandPiece(begin_turn, end_piece);
      }

      this.board_status[end] = status_begin;
      this.board_status[begin] = 0;
    } else {
      this.board_status[end] = status_begin;
      this.board_status[begin] = status_end;
    }
  } // end if
};

/**
 * Move piece from stand (hand) to board
 * 
 * @this {ShogiBoard}
 * @param {enum} turn - this.BLACK or this.WHITE
 * @param {string} piece_name - name of piece (refer to this.piece_name)
 * @param {number} to_pos - position where put piece
 */
ShogiBoard.prototype.dropPieceFromStand = function(turn, piece_name, to_pos) {
  console.log('dropPieceFromStand: turn:' + turn +
              ' piece_name:' + piece_name +
              ' to_pos:' + to_pos);
  /// FIXME:error handling (example: if turn doesn't have piece of `piece_name`)
  var piece_kind = this.piece_kind[piece_name];
  if (turn === this.WHITE) {
    this.white_hand_pieces[piece_name]--;
    this.board_status[to_pos] = piece_kind | this.WHITE_BIT;
  } else if (turn === this.BLACK) {
    this.black_hand_pieces[piece_name]--;
    this.board_status[to_pos] = piece_kind;
  }
};

/**
 * Move one piece one turn's hand to another's
 * 
 * @this {ShogiBoard}
 * @param {enum} from_turn - turn which move from (this.BLACK or this.WHITE)
 * @param {string} piece_name - piece name of moving (refer to this.piece_name)
 */
ShogiBoard.prototype.givePieceFromStand = function(from_turn, piece_name) {
  console.log('givePieceFromStand(' + from_turn + ',' + piece_name + ')');
  /// FIXME:error handling (example: turn doesn't have piece of `piece_name`)
  if (from_turn === this.WHITE) {
    this.white_hand_pieces[piece_name]--;
    this.black_hand_pieces[piece_name]++;
  } else if (from_turn === this.BLACK) {
    this.black_hand_pieces[piece_name]--;
    this.white_hand_pieces[piece_name]++;
  }
};

/**
 * Change piece kind 
 * order (Black's -> Black's promoted -> White's -> White's promoted) circulation
 * 
 * @this {ShogiBoard}
 * @param {number} pos - position of shogi board
 */
ShogiBoard.prototype.changePieceKind = function(pos) {
  if (pos <= 11 || pos >= 100) {
    return;
  }

  console.log('changePieceKind(' + pos + ')');
  /// 先手駒 -> 先手成駒 -> 後手駒 -> 後手成駒の順
  if (this.board_status[pos] === 0) {
    return;
  }

  var temp = this.getBoardStatus(pos);
  var turn = temp[0];
  var status = this.board_status[pos];
  console.log('Change Before: pos:' + pos + ' turn:' + turn +
             ' status:' + status);
  if (turn === this.BLACK) {
    if (status < this.PROMOTE_THRESHOLD) {
      if (status !== this.piece_kind['KI'] &&
          status !== this.piece_kind['OU']) {
          status += this.PROMOTE_PLUS;
      } else {
        turn = this.WHITE;
      }
    } else {
      turn = this.WHITE;
      status -= this.PROMOTE_PLUS;
    }
    this.setBoardStatus(pos, turn, status);
  } else if (turn === this.WHITE) {
    if (status < (this.PROMOTE_THRESHOLD | this.WHITE_BIT)) {
      if ((status & (~this.WHITE_BIT)) !== this.piece_kind['KI'] &&
          (status & (~this.WHITE_BIT)) !== this.piece_kind['OU']) {
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
};

/**
 * Get SFEN string that represents shogi board
 * 
 * @this {ShogiBoard}
 * @param {enum} turn - player to move piece 
 * @return {string} SFEN string
 */
ShogiBoard.prototype.getSFENString = function(turn) {
  var sfen = '';
  for (var row = 1; row <= 9; row++) {
    var empty_num = 0;
    for (var col = 9; col >= 1; col-- ) {
      var pos = col * 10 + row;
      var status = this.board_status[pos];
      if (status === 0) {
        empty_num++;
      }
      else {
        if (empty_num !== 0) {
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
    if (empty_num !== 0) {
      sfen += String(empty_num);
    }
    if (row !== 9) {
      sfen += '/';
    }
    empty_num = 0;
  }

  if (typeof turn === 'undefined' || turn === this.BLACK) {
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
      console.info('piece:' + piece + ' sfen_name:' + sfen_name)
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

  if (no_hand_piece === true) {
    sfen += '- ';
  } else {
    sfen += ' ';
  }

  /// TODO:move number is now only 1.
  sfen += '1';
  return sfen;
};

/**
 * Get BOD string (in UTF-8) that represents shogi board
 */
ShogiBoard.prototype.getBoardString = function() {
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
      else if (status !== 0){
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
};

/**
 * Get string that represents one's hand (for BOD string)
 * 
 * @this {ShogiBoard}
 * @param {array} array of hand pieces
 */
ShogiBoard.prototype.getHandString = function(hand_pieces) {
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

  if (hand_piece_added === false) {
    str += 'なし\n';
  } else {
    str += '\n';
  }
  return str;
};

/**
 * Set board turn
 * 
 * @this {ShogiBoard}
 * @param {enum} turn - turn of shogi board (NOTURN, BLACK or WHITE) 
 */
ShogiBoard.prototype.setBoardTurn = function(turn) {
  if (turn !== this.NOTURN && turn !== this.BLACK && turn !== this.WHITE) {
    console.debug('ShogiBoard.setBoardTurn(): Illegal param:' + turn);
    return false;
  }
  this.board_turn = turn;
  return true;
};

/**
 * Get board turn
 * 
 * @this {ShogiBoard}
 */
ShogiBoard.prototype.getBoardTurn = function() {
  return this.board_turn;
}
 
// ShogiBoard definition ends


// BoardCanvas definition starts
/**
 * Canvas Element which expresses Shogi board.
 * 
 * @constructor
 * @param {DOM} canvas - DOM of html canvas
 * @param {ShogiBoard} shogi_board - the ShogiBoard instance which manages board status
 * @param {PieceImages} piece_images - Images of shogi pieces
 * @param {NumberImages} number_images - Images of numbers 
 */
function BoardCanvas(canvas, shogi_board,
                     piece_images, number_images) {
  this.canvas = canvas;
  console.log('canvas textBaseline set:');
  var ctx = this.canvas.getContext('2d');

  this.shogi_board = shogi_board;
  this.piece_images = piece_images;
  this.number_images = number_images;
  this.click_status = { pos:undefined, piece:undefined }; /// Now Click Status

  this.black_hand_pieces_y = {};
  this.white_hand_pieces_y = {};

  this.select_square_x = undefined;
  this.select_square_y = undefined;

  /** coordinate constants */
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

  /** players names and a title variables */    
  this.TITLE_MARK_WIDTH = 16;
  this.TITLE_MARK_HEIGHT = 16;
  this.WHITE_TITLE_MARK_X = 5;
  this.PLAYER_Y = 5;
  this.TITLE_Y = 30,
  this.black_name = '';
  this.white_name = '';
  this.title = '';
}

BoardCanvas.prototype.onMouseOver = function(evt) {
  return '';
};

BoardCanvas.prototype.onMouseMove = function(evt) {
  return '';
};

/**
 * Event Handler when mouse left button is clicked
 */
BoardCanvas.prototype.onLeftClick = function(evt) {
  var temp;
  var ctx = this.canvas.getContext('2d');
  console.log('this:' + typeof this);

  temp = this.getPos(evt);
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
  if (pos_y < 1 || pos_y > 9) {
    return;
  }
  if (pos_x < 1) {
    pos = 0;
  } else if (pos_x > 9) {
    pos = 1;
  }

  var click_status = this.click_status.pos;
  console.log('click_status:' + click_status);

  if (typeof click_status === 'undefined') {
    /// if nothing is selected.
    if (pos_x >= 1 && pos_x <= 9) {
      var status = this.shogi_board.getBoardStatus(pos);
      console.log('pos:' + pos + ' status:' + status[0]);
      if (status[0] !== this.shogi_board.EMPTY) {
        /// Write all, and erase all
        console.log('width: ' + this.canvas.width +
                    ' height: ' + this.canvas.height);
        this.drawSquareOnBoard(pos_x, pos_y);
        this.drawAll();

        this.click_status.pos = pos;
        console.log('pos:' + this.click_status.pos);
      }
    } else if (pos_x > 9) {
      /// Clicked White Piece Stand
      /// Detect which hand piece is selected.
      var selected_y = 0;
      var selected_piece = undefined;
      for (var piece in this.white_hand_pieces_y) {
        if (y > this.white_hand_pieces_y[piece] &&
            y < (this.white_hand_pieces_y[piece] +
                 this.PIECE_IMAGE_HEIGHT) ) {
          selected_piece = piece;
          selected_y = this.white_hand_pieces_y[piece];
        }
      }

      if (selected_y !== 0 && typeof selected_piece !== 'undefined') {
        this.drawSquare(this.WHITE_X, selected_y);
        this.drawAll();

        this.click_status.pos = this.shogi_board.WHITE;
        this.click_status.piece = selected_piece;
      }

      console.log('white piece stand clicked.');
      console.log('selected_y:' + selected_y +
                  ' seleceted_piece:' + selected_piece);
    } else if (pos_x < 1) {
     /// Clicked Black Piece Stand
     /// Detect which hand piece is selected.
      var selected_y = 0;
      var selected_piece = undefined;
      for (var piece in this.black_hand_pieces_y) {
        if (y > this.black_hand_pieces_y[piece] &&
            y < (this.black_hand_pieces_y[piece] +
                 this.PIECE_IMAGE_HEIGHT)) {
            selected_piece = piece;
            selected_y = this.black_hand_pieces_y[piece];
        }
      }

      if (selected_y !== 0 && typeof selected_piece !== 'undefined') {
        console.log('black hand piece clicked.');
        this.drawSquare(this.BLACK_X, selected_y);
        this.drawAll();

        this.click_status.pos = this.shogi_board.BLACK;
        this.click_status.piece = selected_piece;
      }

      console.log('black piece stand clicked.');
      console.log('selected_y:' + selected_y +
                  ' seleceted_piece:' + selected_piece);
    }
  } else if (click_status > 10 && click_status < 100) {
    /// if already selected any square.
    console.log('click_status:' + click_status + ' -> ' + pos);
    this.shogi_board.swapBoardPieces(click_status, pos);
    this.removeSquare();

    this.drawAll();
    this.click_status.pos = undefined;
    this.click_status.piece = undefined;
  } else if (click_status < 10) {
    if (pos < 10) {
      var piece_name = this.click_status.piece;
      if (pos === 0 && click_status === this.shogi_board.WHITE) {
          this.shogi_board.givePieceFromStand(this.shogi_board.WHITE, piece_name);
      } else if (pos === 1 && click_status === this.shogi_board.BLACK) {
          this.shogi_board.givePieceFromStand(this.shogi_board.BLACK, piece_name);
      }

      this.removeSquare();
      this.drawAll();

      this.click_status.pos = undefined;
      this.click_status.piece = undefined;
    } else {
      var from_pos = this.click_status.pos;
      var piece_name = this.click_status.piece;
      var to_pos = temp.join('');
      var to_pos_status = this.shogi_board.getBoardStatus(to_pos);

      console.log('to_pos_status:' + to_pos + ':' + to_pos_status[0]);

      if (to_pos_status[0] === this.shogi_board.EMPTY) {
          this.shogi_board.dropPieceFromStand(from_pos, piece_name, to_pos);
          this.removeSquare();
          this.drawAll();

          this.click_status.pos = undefined;
          this.click_status.piece = undefined;
      }
    }
  }
};

/**
 * Draw yellow square which left position is x, top position is y
 * 
 * @this {BoardCanvas}
 * @param {number} x - square's left side
 * @param {number} y - square's top side
 */
BoardCanvas.prototype.drawSquare = function(x, y) {
  console.log('drawSquare: x:' + x + ' y:' + y);
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = "rgb(255, 255, 192)";
  ctx.fillRect(x, y, this.SQUARE_WIDTH, this.SQUARE_HEIGHT);

  this.select_square_x = x;
  this.select_square_y = y;
};

/**
 * Draw yellow square on shogi board square
 * 
 * @this {BoardCanvas}
 * @param {number} pos_x - position x (shogi board number)
 * @param {number} pos_y - position y (shogi board number)
 */
BoardCanvas.prototype.drawSquareOnBoard = function (pos_x, pos_y) {
  console.log('drawSquareOnBoard: ' + pos_x + '' + pos_y);
  var ctx = this.canvas.getContext('2d');
  /// draw yellow square
  ctx.fillStyle = 'rgb(255, 255, 192)';

  var origin_x = this.BOARD_X + this.BOARD_WIDTH_PADDING;
  var origin_y = this.BOARD_Y + this.TITLE_HEIGHT + this.BOARD_HEIGHT_PADDING;
  console.log('fillRect:(' + (origin_x + (9 - pos_x) * this.SQUARE_MULTIPLE_X) + ',' + (origin_y + (pos_y - 1) * this.SQUARE_MULTIPLE_Y) + ',' +  this.SQUARE_MULTIPLE_X + ',' + this.SQUARE_MULTIPLE_Y + ')');

  var x = origin_x + (9 - pos_x) * this.SQUARE_MULTIPLE_X;
  var y = origin_y + (pos_y - 1) * this.SQUARE_MULTIPLE_Y;

  ctx.fillRect(x, y,
               this.SQUARE_WIDTH, this.SQUARE_HEIGHT);
  console.log('fillRect: pos_x:' + pos_x + ' pos_y:' + pos_y);

  this.select_square_x = x;
  this.select_square_y = y;
};

/**
 * Remove yellow square on shogi board
 */
BoardCanvas.prototype.removeSquare = function() {
  this.select_square_x = undefined;
  this.select_square_y = undefined;
};

/**
 * Event handler when mouse right button is clicked
 */
BoardCanvas.prototype.onRightClick = function(evt) {
  var temp = this.getPos(evt);
  var x = temp[0];
  var y = temp[1];
  temp = this.convertPositionToBoard(x, y);
  var pos_x = temp[0];
  var pos_y = temp[1];

  var pos = temp.join('');
  console.log('RightClick: pos_x:' + pos_x + ' pos_y:' + pos_y);
  this.shogi_board.changePieceKind(pos);
  this.removeSquare();

  this.drawAll();
};

/**
 * Draw pieces by this.shogi_board's status
 */
BoardCanvas.prototype.drawPieces = function() {
  console.log('drawPieces width:' + this.canvas.width +
              ' height:' + this.canvas.height );
  var ctx = this.canvas.getContext('2d');
  var image = this.piece_images.getBoardImage();
  console.log('x: ' + this.BOARD_X +
              ' y:' + (this.BOARD_Y + this.TITLE_HEIGHT) + ' image:' + typeof image);
  ctx.drawImage(image, this.BOARD_X, this.BOARD_Y + this.TITLE_HEIGHT);

  image = this.piece_images.getBlackImage();
  ctx.drawImage(image, this.BLACK_X, this.BLACK_Y + this.TITLE_HEIGHT);

  image = this.piece_images.getWhiteImage();
  this.drawRotateImage(image, this.WHITE_X, this.WHITE_Y + this.TITLE_HEIGHT);

  var pieces = this.shogi_board.getAllPieces();
  for(var i = 0;i < pieces.length; i++) {
    var pos = pieces[i][0];
    var turn = pieces[i][1][0];
    var piece = pieces[i][1][1];
    console.log('pos:' + pos +
                ' turn:' + turn +
                ' piece:' + piece);

    var x = this.BOARD_X + this.SQUARE_ORIGIN_X +
            this.SQUARE_MULTIPLE_X * (9 - parseInt(pos / 10));
    var y = this.BOARD_Y + this.TITLE_HEIGHT + this.SQUARE_ORIGIN_Y +
            this.SQUARE_MULTIPLE_Y * ((pos % 10) - 1);

    image = this.piece_images.getBoardImage();

    if (turn === this.shogi_board.BLACK) {
      image = this.piece_images.getImage(piece);
      ctx.drawImage(image, x, y);
    } else if (turn === this.shogi_board.WHITE) {
      image = this.piece_images.getImage(piece);
      this.drawRotateImage(image, x, y);
    }

  }

  /// Draw Hand Pieces
  /// Draw Black Hand Pieces
  console.log('Draw Black Hand Pieces:');
  pieces = this.shogi_board.getHandPieces(this.shogi_board.BLACK);
  this.black_hand_pieces_y = {};

  var piece_order = this.shogi_board.hand_piece_order;
  var y = this.BLACK_Y + this.TITLE_HEIGHT + this.BLACK_MARK_HEIGHT ;
  for (var i = 0;i < piece_order.length; i++) {
    var x = this.BLACK_X;
    var piece_name = piece_order[i];
    var piece_num = pieces[piece_name];
    console.log('piece_name:' + piece_name +
                ' piece_num:' + piece_num);

    if (piece_num > 0) {
      image = this.piece_images.getImage(piece_name);
      ctx.drawImage(image, x, y);
      this.black_hand_pieces_y[piece_name] = y;

      y += this.PIECE_IMAGE_HEIGHT + this.IMAGE_PADDING_Y;

      /// Write number
      if (piece_num > 1) {
        var num;
        if (piece_num >= 10) {
          // Write two-digit number of two
          num = parseInt(piece_num / 10);
          image = this.number_images.getImage(num);
          ctx.drawImage(image, x, y);
        }
        x += this.NUMBER_IMAGE_WIDTH;
        num = piece_num % 10;
        image = this.number_images.getImage(num);

        console.log('image:' + typeof image + ' x:' + x +
                   ' y:' + y);

        ctx.drawImage(image, x, y);
        y += this.NUMBER_IMAGE_HEIGHT + this.IMAGE_PADDING_Y;
      }
    }
  }

  console.log('Draw White Hand Pieces:');
  /// Draw White Hand Pieces
  pieces = this.shogi_board.getHandPieces(this.shogi_board.WHITE);
  y = this.WHITE_Y + this.TITLE_HEIGHT;
  this.white_hand_pieces_y = {};

  var first_draw = true;
  for (var i = 0; i < piece_order.length; i++) {
    var x = this.WHITE_X;
    var piece_name = piece_order[i];
    var piece_num = pieces[piece_name];
    console.log('piece_name:' + piece_name +
                ' piece_num:' + piece_num);

    if (piece_num > 0) {
      image = this.piece_images.getImage(piece_name);
      if (first_draw === true) {
        y -= this.WHITE_MARK_HEIGHT;
        first_draw = false;
      } else {
        y -= (this.PIECE_IMAGE_HEIGHT + this.IMAGE_PADDING_Y);
      }
      this.drawRotateImage(image, x, y);
      this.white_hand_pieces_y[piece_name] = y;

      if (piece_num > 1) {
        y -= (this.NUMBER_IMAGE_HEIGHT + this.IMAGE_PADDING_Y);
        console.log('piece_num:' + piece_num);
        var num;
        num = piece_num % 10;
        image = this.number_images.getImage(num);
        this.drawRotateImage(image, x, y);

        x += this.NUMBER_IMAGE_WIDTH;
        if (piece_num >= 10) {
          num = parseInt(piece_num / 10);
          image = this.number_images.getImage(num);
          this.drawRotateImage(image, x, y);
        }
      }
    }
  }
};

/**
 * Draw 180 degree rotated image to (x, y)
 * 
 * @param {PieceImage, NumberImage} image - Image to draw
 * @param {number} x - image's left
 * @param {number} y - image's top
 */
BoardCanvas.prototype.drawRotateImage = function(image, x, y) {
  console.log('drawRotateImage(' + image + ',' + x + ',' + y + ')');
  var ctx = this.canvas.getContext('2d');
  ctx.save();
  ctx.translate(x * 2 + image.width, y * 2 + image.height);
  ctx.rotate(Math.PI);
  ctx.drawImage(image, x, y);
  ctx.restore();
};
  
/**
 * Convert (x, y) position to shogi board coordinate
 * 
 * @param {number} x
 * @param {number} y
 * @return {array} [corrdinate of shogi board x, coordinate of shogi board y]
 */
BoardCanvas.prototype.convertPositionToBoard = function(x, y) {
  console.log('convertPositionToBoard(' + x + ', ' + y + ') called:');
  var pos_x = x;
  var pos_y = y;
  console.log('pos_x:' + pos_x);
  pos_x =  pos_x - this.BOARD_X - this.BOARD_WIDTH_PADDING;
  console.log('pos_x:' + pos_x);
  pos_x = pos_x / this.BOARD_MULTIPLE_X;
  console.log('pos_x:' + pos_x);
  if (pos_x < 0) {
    pos_x = 10;
  } else {
    pos_x = 9 - parseInt(pos_x);
  }
  console.log('pos_x:' + pos_x);

  console.log('pos_y:' + pos_y);
  pos_y = pos_y - this.BOARD_Y - this.BOARD_HEIGHT_PADDING - this.TITLE_HEIGHT;
  console.log('pos_y:' + pos_y);
  pos_y = pos_y / this.BOARD_MULTIPLE_Y;
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
  
/**
 * Get clicked position from event object
 * 
 * @param {event} evt - event object when click event handler is called
 * @return {array} [clicked position x, clicked position y]
 */
BoardCanvas.prototype.getPos = function(evt) {
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

  pos_x -= this.canvas.offsetLeft;
  pos_y -= this.canvas.offsetTop;

  console.log('pos_x:' + pos_x + ' pos_y:' + pos_y);

  return [pos_x, pos_y];
};

/**
 * Draw Black's name (with black mark)
 * 
 * @param {string} black_name - name of black
 */
BoardCanvas.prototype.drawBlackName = function(black_name) {
  console.debug('BoardCanvas.drawBlackName() called black_name:' + black_name);
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.font = '16px sans-serif';
  ctx.textBaseline = 'top';

  if (black_name !== '' && typeof black_name !== 'undefined') {
    // Draw black mark
    var draw_black_name = black_name;
    if (typeof black_name === 'undefined') {
      /// Draw (or erase) the current black name
      draw_black_name = this.black_name;
    } else {
      /// for fillText
      draw_black_name = black_name.replace(/\s/g, '\u0020');
    }
    if (draw_black_name.match(/^(\s|\u0020)*$/)) {
      return;
    }
    console.log('draw_black_name:' + draw_black_name);

    var black_name_width = ctx.measureText(draw_black_name);
    var clear_black_name_width = ctx.measureText(this.black_name);

    console.log('black_name_width:' + black_name_width.width +
                ' HEIGHT:' + this.TITLE_MARK_HEIGHT);
    console.log('clear_black_name_width:' + clear_black_name_width.width);

    var black_image = this.piece_images.getBlackImage();
    var black_title_x_left = this.CANVAS_WIDTH - (black_name_width.width +
                                                  this.TITLE_MARK_WIDTH +
                                                  this.IMAGE_PADDING_X * 2);
    var clear_black_title_x_left = 
          this.CANVAS_WIDTH -
          (clear_black_name_width.width +
           this.TITLE_MARK_WIDTH +
           this.IMAGE_PADDING_X);

    var black_title_x = black_title_x_left;
    ctx.drawImage(black_image, black_title_x, this.PLAYER_Y,
                 this.TITLE_MARK_WIDTH, this.TITLE_MARK_HEIGHT);
    black_title_x += this.TITLE_MARK_WIDTH + this.IMAGE_PADDING_X;
    console.log('fillText:' + draw_black_name + " x:" + black_title_x +
                ' y:' + this.PLAYER_Y + " WIDTH:" + this.NAME_IMAGE_WIDTH);
    ctx.fillText(draw_black_name, black_title_x, this.PLAYER_Y);
    this.black_name = draw_black_name;
  } else {
    this.black_name = '';
  }
};

/**
 * Draw white's name (with white mark)
 * 
 * @param {string} white_name - name of white
 */
BoardCanvas.prototype.drawWhiteName = function(white_name) {
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.font = '16px sans-serif';
  ctx.textBaseline = 'top';

  if (white_name !== '' && typeof white_name !== 'undefined') {
    var draw_white_name;
    if (typeof white_name === 'undefined') {
      /// Draw (or erase) the current white name
      draw_white_name = this.white_name;
    } else {
      /// for fillText
      draw_white_name = white_name.replace(/\s/g, '\u0020');
    }
    if (draw_white_name.match(/^(\s|\u0020)*$/)) {
      return;
    }
    console.log('draw_white_name:' + draw_white_name);

    var white_name_width  = ctx.measureText(draw_white_name);
    var clear_white_name_width = ctx.measureText(this.white_name);

    console.log('white_name_width:' + white_name_width.width +
                ' HEIGHT:' + this.TITLE_MARK_HEIGHT);

    // Draw white mark
    var white_image = this.piece_images.getWhiteImage(Math.PI);
    var white_title_x = this.WHITE_TITLE_MARK_X;

    ctx.drawImage(white_image, white_title_x, this.PLAYER_Y,
                  this.TITLE_MARK_WIDTH, this.TITLE_MARK_HEIGHT);
    white_title_x += this.TITLE_MARK_WIDTH + this.IMAGE_PADDING_X;
    ctx.fillText(draw_white_name, white_title_x, this.PLAYER_Y);

    this.white_name = draw_white_name;
  } else {
    this.white_name = '';
  }
};

/**
 * Draw title of shogi board (defined by user)
 * 
 * @param {string} title - drawing string
 */
BoardCanvas.prototype.drawTitle = function(title) {
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.font = '16px sans-serif';
  ctx.textBaseline = 'top';


  ctx.clearRect(0, this.TITLE_Y, this.canvas.width, this.TITLE_HEIGHT);

  var title_name_width  = ctx.measureText(title);
  console.log('title_name_width:' + title_name_width.width +
              ' HEIGHT:' + this.TITLE_MARK_HEIGHT);
  console.log('draw_title');

  if (title !== '') {
    var draw_title;
    if (typeof title === 'undefined') {
      // 今保持されているタイトルを書く
      draw_title = this.title;
    } else {
      draw_title = title.replace(/\s/g, '\u0020');
    }

    // Determine the center by the length of title
    var center = parseInt(this.CANVAS_WIDTH / 2);
    var title_width = ctx.measureText(draw_title);
    var center_x = center - parseInt(title_width.width / 2);
    ctx.fillText(draw_title, center_x, this.TITLE_Y);

    this.title = draw_title;
  }
};

/**
 * Get title of shogi board
 */
BoardCanvas.prototype.getTitle = function() {
  return this.title.replace(/\u0020/g, ' ');
};

/**
 * Get black's name
 */
BoardCanvas.prototype.getBlackName = function() {
  return this.black_name.replace(/\u0020/g, ' ');
};

/**
 * Get white's name
 */
BoardCanvas.prototype.getWhiteName = function() {
  return this.white_name.replace(/\u0020/g, ' ');
};

/**
 * Clear all region of canvas
 */
BoardCanvas.prototype.clearAll = function() {
  var ctx = this.canvas.getContext('2d');
  ctx.clearRect(0, 0,
                this.canvas.width,
                this.canvas.height);
};

/**
 * Draw header strings 
 */
BoardCanvas.prototype.drawHeader = function() {
  this.drawBlackName(this.black_name);
  this.drawWhiteName(this.white_name);
  this.drawTitle(this.title);
};

/**
 * Draw turn mark (yellow square)
 */
BoardCanvas.prototype.drawTurn = function() {
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = 'rgb(255, 212, 0)';
  ctx.globalAlpha = 0.5;
  console.debug('BoardCanvas.drawTurn(): called turn:' + this.shogi_board.getBoardTurn());
  if (this.shogi_board.getBoardTurn() === this.shogi_board.BLACK) {
    console.debug('draw Black Turn Mark');
    ctx.fillRect(this.BLACK_X - 5, this.BLACK_Y + this.TITLE_HEIGHT - 5, 
                  this.BLACK_MARK_WIDTH, this.BLACK_MARK_HEIGHT);

  } else if (this.shogi_board.getBoardTurn() === this.shogi_board.WHITE) {
    console.debug('draw White Turn Mark');
    ctx.fillRect(this.WHITE_X - 5, this.WHITE_Y + this.TITLE_HEIGHT - 5, 
                  this.WHITE_MARK_WIDTH, this.WHITE_MARK_HEIGHT);
  } else {
    console.debug('No turn mark draw');
  }
  ctx.globalAlpha = 1;
};

/**
 * Draw all elements
 */
BoardCanvas.prototype.drawAll = function() {
  console.debug('BoardCanvas.drawAll(): called');
  this.clearAll();
  this.drawHeader();
  if (typeof this.select_square_x !== 'undefined') {
    console.log('Square x:' + this.select_square_x +
                ' y:' + this.select_square_y);
    this.drawSquare(this.select_square_x, this.select_square_y);
  }
  this.drawPieces();
  this.drawTurn();
  // Call event handler when board status is changed
  this.onBoardChange();
};
  
/**
 * Change images (e.g. kanji piece to international piece)
 * 
 * @this {BoardCanvas}
 * @param {PieceImages} piece_images - images of pieces
 */
BoardCanvas.prototype.changeImages = function(piece_images) {
  // TODO:implement
};
  
/**
 * Event handler which called when board status is changed
 */    
BoardCanvas.prototype.onBoardChange = function() {
  // Override here
};
// BoardCanvas definition ends

// PieceImages defitition starts
/**
 * Represents piece images
 * @constructor
 */
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

  this.ALL_IMAGE_NUM = 17;
};

/**
 * Init images 
 * 
 * @this {PieceImages}
 * @param {function} on_complete_callback - function when loading is completed
 * @param {string} kind - 'kanji','alphabet' or 'international'
 */
PieceImages.prototype.initImages = function(on_complete_callback, kind) {
  this.callback = on_complete_callback;
  this.board_url = IMAGEPATH + 'board.png';
  var suffix = '';

  if (typeof kind !== 'undefined' || kind !== 'kanji') {
    if (kind === 'alphabet' || kind === 'international') {
      this.board_url = PATH + 'static_img/board_alphabet.png';
      suffix = '_' + kind;
    }
  }

  this.black_url = IMAGEPATH + 'black.png';
  this.white_url = IMAGEPATH + 'white.png';
  this.piece_urls['FU'] = IMAGEPATH + 'fu' + suffix + '.png';
  this.piece_urls['KY'] = IMAGEPATH + 'ky' + suffix + '.png';
  this.piece_urls['KE'] = IMAGEPATH + 'ke' + suffix + '.png';
  this.piece_urls['GI'] = IMAGEPATH + 'gi' + suffix + '.png';
  this.piece_urls['KI'] = IMAGEPATH + 'ki' + suffix + '.png';
  this.piece_urls['HI'] = IMAGEPATH + 'hi' + suffix + '.png';
  this.piece_urls['KA'] = IMAGEPATH + 'ka' + suffix + '.png';
  this.piece_urls['OU'] = IMAGEPATH + 'ou' + suffix + '.png';
  this.piece_urls['TO'] = IMAGEPATH + 'to' + suffix + '.png';
  this.piece_urls['NY'] = IMAGEPATH + 'ny' + suffix + '.png';
  this.piece_urls['NK'] = IMAGEPATH + 'nk' + suffix + '.png';
  this.piece_urls['NG'] = IMAGEPATH + 'ng' + suffix + '.png';
  this.piece_urls['UM'] = IMAGEPATH + 'um' + suffix + '.png';
  this.piece_urls['RY'] = IMAGEPATH + 'ry' + suffix + '.png';


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
};

/**
 * Callback function when image loading ends
 */
PieceImages.prototype.onLoad = function() {
  this.piece_images.num_loaded++;
  console.log('Loaded:' + this.piece_images.num_loaded);
  if (this.piece_images.num_loaded === this.piece_images.ALL_IMAGE_NUM) {
      console.log('callback:' + typeof this.piece_images.callback);
    if (typeof this.piece_images.callback === 'function') {
        this.piece_images.callback();
    }
    this.piece_images.num_loaded = 0;
  }
};

/**
 * Load image from specific url
 * 
 * @param {string} filename - URL of image
 */
PieceImages.prototype.loadFromFile = function(filename) {
  console.log('Load from File:' + filename);
  var image = new Image();
  image.onload = PieceImages.prototype.onLoad;
  image.piece_images = this;
  image.src = filename;
  return image;
};

/**
 * Get piece image  
 * 
 * @param {string} name - name of piece
 */
PieceImages.prototype.getImage = function(name) {
  console.log('name:' + name);
  name = name.toUpperCase();
  return this.piece_images[name];
};

/**
 * Get board URL
 */
PieceImages.prototype.getBoardUrl = function() {
  return this.board_url;
};

/**
 * Get black mark URL
 */
PieceImages.prototype.getBlackUrl = function() {
    return this.black_url;
};

/**
 * Get white mark URL
 * 
 * @return {string} white mark URL
 */
PieceImages.prototype.getWhiteUrl = function() {
  return this.white_url;
};

/**
 * Get piece image URL
 * 
 * @param {string} name - specify the name of the piece
 * @return {string} piece image url 
 */
PieceImages.prototype.getImageUrl = function(name) {
  return this.piece_urls[name];
};

/**
 * Get board image
 * 
 * @return {Image} board image
 */
PieceImages.prototype.getBoardImage = function() {
  return this.board_image;
};

/**
 * Get black mark image
 * 
 * @return {Image} black mark image
 */
PieceImages.prototype.getBlackImage = function() {
  return this.black_image;
};

/**
 * Get white mark image
 * 
 * @return {Image} white mark image
 */
PieceImages.prototype.getWhiteImage = function() {
  return this.white_image;
}
// PieceImages definition ends

// NumberImages definition starts
/**
 * Images of numbers
 * @constructor
 */
function NumberImages() {
    this.callback = undefined;
    this.num_loaded = 0;
    this.is_loaded = false;
    this.num_image = {};
    this.ALL_IMAGE_NUM = 10;
}

/**
 * Initialize images
 * 
 * @param {function} on_complete_callback - function when loading is completed
 */
NumberImages.prototype.initImages = function(on_complete_callback) {
  this.callback = on_complete_callback;

  for (var i = 0;i < 10; i++) {
    this.num_image[i] = this.loadFromFile(IMAGEPATH + '' +
                                          i + '.png');
  }
};

/**
 * Callback function when image loading ends
 */
NumberImages.prototype.onLoad = function(filename) {
  this.number_images.num_loaded++;
  if (this.number_images.num_loaded === this.number_images.ALL_IMAGE_NUM) {
    if (typeof this.number_images.callback === 'function') {
      this.number_images.callback();
    }
    this.number_images.num_loaded = 0;
    this.number_images.is_loaded = false;
  }
};

/**
 * Load image from specific url
 * 
 * @param {string} filename - URL of image
 */
NumberImages.prototype.loadFromFile = function(filename) {
  console.log('Load from File:' + filename);
  var image = new Image();
  image.onload = NumberImages.prototype.onLoad;
  image.number_images = this;
  image.src = filename;
  return image;
};

/**
 * Get number image  
 * 
 * @param {string} name - name of number
 */
NumberImages.prototype.getImage = function (num) {
  return this.num_image[num];
};
