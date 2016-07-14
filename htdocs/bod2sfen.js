// -*- coding: utf-8 -*-
//
// bod2sfen.js Copyright 2011-2016 shibacho
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

String.prototype.toArray = function() {
    var array = new Array;
    for (var i=0 ; i < this.length; i++) {
        array.push(this.charAt(i));
    }
    return array;
};

function is_MSIE() {
    var userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("msie") > -1) {
	return true;
    } else {
	return false;
    }
}


if (typeof window.console != 'object') { // IE対策
    window.console = { log:function(){}
    };
}

var URL = '';
var TWITTER_URL = '';
var SHORT_URL = '';
var IMG_URL = '';
var SFEN = '';
var ASPECT_RATIO = 1.0;
var BLANK = 'about:_blank';

$(document).ready(function(){
    $('#board_convert').click(BoardConvert);
    
    $('#example_button').click(function(e) {
        ChangeExampleStatus();
    });

    $('#example_button_under').click(function (e){
        ChangeExampleStatus();
    });

    $('#developer_guide_button').click(function (e){
      if ($('#developer_guide').css('display') == 'none') {
        $('#developer_guide').show('slow');
        $('#developer_guide_button').html(
          $('#developer_guide_hide').text());
      } else {
        $('#developer_guide').hide('slow');
        $('#developer_guide_button').html(
          $('#developer_guide_show').text());
      }
    });

    // $('#ponanza_analysis').click(function (e) {
    //     var text = '@ponanza_shogi ';
    //     text += encodeURIComponent($('#sfen').val());
    //     window.open('https://twitter.com/share?url=&text=' + text, '_blank', 'width=700,height=300');
    // });

    $('#tweet').click(function(e) {
        var sente_name = $('#sente_name').val();
        var gote_name = $('#gote_name').val();
        var shogi_title = $('#shogi_title').val();
        var text = '';
        if (sente_name != '' && gote_name != '') {
            text += sente_name + ' ' +  $('#versus_string').text() + ' ' + gote_name + ':';
        }

        text += shogi_title;

        if (sente_name == '' && gote_name == '' && shogi_title == '') {
            text = $('#board_default_name').text();
        }

        var url = encodeURIComponent(TWITTER_URL);
        text = encodeURIComponent(text);
        window.open('https://twitter.com/share?url=' + url + '&text=' + text, '_blank', 'width=700,height=300');
    });

    $('#move_to_sfen').click(function(e) {
      window.open($('#long_url').val());
    });

    $('#turn_check').change(function() {
        var $turn_check = $('#turn_check');
        if ($turn_check.attr('checked') == 'checked') {
            $('#turn_span').css('color', 'gray');
            $('input[name=turn]').each(function() {
                console.log('disabled:true value:' + $(this).val());
                $(this).css('disabled', 'disabled');
            });
        } else {
            $('#turn_span').css('color', 'black');
            $('input[name=turn]').each(function() {
                console.log('enable: value:' + $(this).val());
                $(this).css('disabled', '');
            });
        }

    });

    $('#sfen_img_width').change(function () {
        UpdateImgUrl('width');
    });

    $('#sfen_img_height').change(function () {
        UpdateImgUrl('height');
    });

    var board_focus_first = true;
    $('#board').focus(function(e) {
        if (board_focus_first) {
            $('#board')[0].value = '';
            $('#board').css('color', 'black');
            board_focus_first = false;
        }
    });

    ///
    $('#board').change(function(e) {
        ChangePlayerNames($('#board').val());
        if ($('#board_result').css('display') != 'none') {
            BoardConvert();
        }
    });

    $('#long_url').blur(function(e) {
        $('#long_url').val(URL);
    });

    $('#blog_code').blur(function(e) {
        $('#blog_code').val(IMG_URL);
    });

    $('#sfen').blur(function(e) {
        $('#sfen').val(SFEN);
    });

});

function ChangeExampleStatus() {
    if ($('#example').css('display') == 'none') {
        if ($('#initial_board_img')[0].src == BLANK) {
            /// 例を見るボタンを押してからWebAPIへのアクセスが起こるようにする
            console.log('initial_board_img_url' + $('#initial_board_img_url').text());
            $('#initial_board_img')[0].src = $('#initial_board_img_url').text();
        }
        if ($('#endgame_board_img')[0].src == BLANK) {
            $('#endgame_board_img')[0].src = $('#endgame_board_img_url').text();
        }

        if ($('#tsume_board_img')[0].src == BLANK) {
            $('#tsume_board_img')[0].src = $('#tsume_board_img_url').text();
        }

        if (typeof $('#tsume_board_img_alphabet')[0] != 'undefined' && $('#tsume_board_img_alphabet')[0].src == BLANK) {
            $('#tsume_board_img_alphabet')[0].src = $('#tsume_board_img_alphabet_url').text();
        }

        $('#example').show('slow');
        $('#example_button').html(
          ('#example_button_to_hide').text());
    } else {
        $('#example').hide('slow');
        $('#example_button').html(
          $('#example_button_to_show').text());
    }
}

function GetSfenPiece(str) {
    var piece_ja2sfen = { '・':''  , '歩':'p' , '香':'l' , '桂':'n' ,
                          '銀':'s' , '金':'g' , '角':'b' , '飛':'r' ,
                          '玉':'k' , 'と':'+p', '杏':'+l', '圭':'+n',
                          '全':'+s', '馬':'+b', '龍':'+r', "竜":'+r'};
    return piece_ja2sfen[str];
}

function GetNumberFromKanji(str) {
    var kanji_number = { '〇':0, '一':1, '二':2, '三':3, '四':4,
                         '五':5, '六':6, '七':7, '八':8, '九':9,
                         '十':10 };
    return kanji_number[str];
}

function Bod2Sfen(bod)
{
    var sfen_board = '';
    var sfen_white_hand = '';
    var sfen_black_hand = '';

    var lines = bod.split(/\r|\n|\r\n/);
    var row_counter = 1;
    var move_count = 0;

    for (var i = 0;i < lines.length; i++) {
        var line = lines[i];
        console.log('line:' + line + ' :length:' + line.length);
        var added_row = false;
        if (line.match(/^\|/)) {
            added_row = true;
            console.log('board row:' + line);
            var pos = 0;
            var empty_counter = 0;
            var add_str = '';
            while (pos < line.length) {
                if (line.charAt(pos) == 'v') {
                    if (empty_counter > 0) {
                        add_str += String(empty_counter);
                        empty_counter = 0;
                    }
                    pos++;
                    add_str += GetSfenPiece(line.charAt(pos));
                    pos++;
                    console.log('add_str:' + add_str);
                } else if (line.charAt(pos) == ' ') {
                    pos++;
                    var piece = GetSfenPiece(line.charAt(pos));
                    if (piece == '') {
                        empty_counter++;
                        console.log('empty_counter:' + empty_counter);
                    } else {
                        if (empty_counter > 0) {
                            add_str += String(empty_counter);
                            empty_counter = 0;
                        }
                        console.log('piece:' + piece);
                        add_str += piece.toUpperCase();
                    }
                    pos++;
                    console.log('add_str:' + add_str);
                } else {
                    pos++;
                }
            }
            sfen_board += add_str;
            if (empty_counter != 0) {
                sfen_board += String(empty_counter);
            }
            row_counter++;
        } else if (line.match(/^先手の持駒：(.*)/)) {
            var hand_piece = RegExp.$1;
            sfen_black_hand = Handpiece2Sfen(hand_piece);
            sfen_black_hand = sfen_black_hand.toUpperCase();
            console.log('sfen_black_hand:' + sfen_black_hand);
        } else if (line.match(/^後手の持駒：(.*)/)) {
            var hand_piece = RegExp.$1;
            sfen_white_hand = Handpiece2Sfen(hand_piece);
            console.log('sfen_white_hand:' + sfen_white_hand);
        } else if (line.match(/^手数＝(\d+)/)) {
            move_count = RegExp.$1;
        }

        /// 最後の列にはスラッシュを入れない
        if (added_row && row_counter <= 9) {
            sfen_board += '/';
        }
        console.log('now_sfenboard:' + sfen_board);
    }
    var sfen = '';
    sfen += sfen_board + ' ';
    sfen += $('input[name=turn]:checked').val() + ' ';

    if (sfen_black_hand == '' && sfen_white_hand == '') {
        /// どちらも持ち駒がない場合
        sfen += '- ';
    } else {
        sfen += sfen_black_hand + sfen_white_hand + ' ';
    }

    if (move_count == 0) { /// 手数の情報がない場合は0とみなす
        sfen += '0';
    } else {
        sfen += String(move_count);
    }

    return sfen;
}

function ChangePlayerNames(bod) {
    var lines = bod.split(/\r|\n|\r\n/);
    for (var i=0 ; i < lines.length; i++) {
        var line = lines[i];
        if (line.match(/^先手：(.*)/)) {
            var black_name = RegExp.$1;
            $('#sente_name').val(black_name);
        } else if (line.match(/後手：(.*)/)) {
            var white_name = RegExp.$1;
            $('#gote_name').val(white_name);
        }
    }
}

function UpdateImgUrl(priority) {
    var img_url = 'img src="' + URL + '"';
    var width  = $('#sfen_img_width').val();
    var height = $('#sfen_img_height').val();
    console.log('UpdateImgUrl(): width:' + width + ' height:' + height);

    if ($('#keep_sfen_img_aspect').attr('checked') == 'checked') {
        console.log('KEEP_ASPECT_RATIO: true priority:' + priority);
        if (priority == 'width') {
            height = parseInt(width / ASPECT_RATIO);
            $('#sfen_img_height').val(height);
        } else if (priority == 'height') {
            width = parseInt(height * ASPECT_RATIO);
            $('#sfen_img_width').val(width);
        }
    }

    if (typeof width != 'undefined') {
        img_url += ' width="' + width + '"';
        $('#sfen_preview')[0].width = width;
    }

    if (typeof height != 'undefined') {
        img_url += ' height="' + height + '"';
        $('#sfen_preview')[0].height = height;
    }

    IMG_URL = '<' + img_url + '>';
    $('#blog_code').val(IMG_URL);
}

/// 持ち駒をSFEN文字列に変える
function Handpiece2Sfen(str)
{
    var sfen_hand = '';
    console.log('Handpiece2sfen() called:' + str);
    if (str == 'なし') {
        return '';
    } else {
        var pieces = str.split('　');
        for (var i = 0;i < pieces.length; i++) {
            var chars = pieces[i].toArray();

            var num = 0;
            var piece = '';

            /// 持ち駒の漢字を一文字ずつ処理する
            for (var j = 0;j < chars.length; j++) {
                console.log('chars[' + j + ']:' + chars[j]);
                var character = GetSfenPiece(chars[j]);
                if (typeof character == "undefined") { /// 漢数字
                    num += GetNumberFromKanji(chars[j]);
                } else { /// 持ち駒
                    piece = GetSfenPiece(chars[j]);
                }
            }

            /// 2つ以上の時は持ち駒の数と種類を記録
            if (num >= 2) {
                sfen_hand += String(num);
            }
            sfen_hand += piece;
        }
    }
    console.log('sfen_hand:' + sfen_hand);
    return sfen_hand;
}

function UpdateUrl() {
    console.log('UpdateUrl(): Called.');
    SFEN = Bod2Sfen($('#board').val());
    console.log("sfen:" + SFEN);

    var sfen_encode = encodeURIComponent(SFEN);

    var query = "sfen=";
    query += sfen_encode;
    console.log('last_move: ' + $('#last_move').val());
    if ( $('#last_move').val() != '') {
        query += '&lm=' + $('#last_move').val();
    }

    if ( $('#sente_name').val() != '') {
        query += '&sname=' + encodeURIComponent($('#sente_name').val());
    }

    if ( $('#gote_name').val() != '') {
        query += '&gname=' + encodeURIComponent($('#gote_name').val());
    }

    if ( $('#shogi_title').val() != '') {
        query += '&title=' + encodeURIComponent($('#shogi_title').val());
    }

    console.log('turn_checked:' + $('#turn_check').attr('checked'));

    if ( $('#turn_check').attr('checked') == 'checked') {
        query += '&turn=off';
    }
    query += '&piece=' + $('input[name=piece]:checked').val() ;
    
    URL = "http://" + location.host + "/sfen?" + query;
    TWITTER_URL = "http://" + location.host + "/twiimg?" + query; 
}

var SFEN_IMAGE = undefined;
function BoardConvert(e)
{
    console.log('BoardConvert() Called:');
    UpdateUrl();

    $('#long_url').val(URL);
    $('#twiimg_url').html(TWITTER_URL);
    $('#sfen').val(SFEN);

    /// Image オブジェクトを作りなおさないと
    /// width heightが固定された値になってしまう
    SFEN_IMAGE = new Image();
    SFEN_IMAGE.onload = function() {
        console.log('onload called():');
        var width = SFEN_IMAGE.width;
        var height = SFEN_IMAGE.height;
        console.log(' width:' + width + ' height:' + height);
        $('#sfen_img_width').val(width);
        $('#sfen_img_height').val(height);
        ASPECT_RATIO = width / height;
        UpdateImgUrl();
    };
    SFEN_IMAGE.src = URL;
    $('#sfen_preview').attr('src',SFEN_IMAGE.src);
    $('#board_result').show("slow");
    $('#blog_code')[0].select();

}
