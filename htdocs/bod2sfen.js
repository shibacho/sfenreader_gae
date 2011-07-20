
// -*- coding: utf-8 -*-
//
// bod2sfen.js Copyright 2011 fantakeshi.
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

if (typeof window.console != 'object') { // IE対策
    window.console = { log:function(){}      
    };
}

var URL = '';
var SHORT_URL = '';
var IMG_URL = '';
var SFEN = '';
var BLANK = 'about:_blank';

$(document).ready(function(){
    $('#board_convert').click(BoardConvert);
    $('#example_button').click(function(e) {
        ChangeExampleStatus();
    });

    $('#ponanza_analysis').click(function (e) {
        var text = '@ponanza_shogi ';
        text += encodeURIComponent($('#sfen').val());
        window.open('https://twitter.com/share?url=&text=' + text, '_blank', 'width=700,height=300');
        void(0);
    });

    $('#tweet').click(function(e) {
        var sente_name = $('#sente_name').val();
        var gote_name = $('#gote_name').val();
        var shogi_title = $('#shogi_title').val();
        var text = '';
        if (sente_name != '' && gote_name != '') {
            text += sente_name + ' 対 ' + gote_name + ':';
        }

        text += shogi_title;
        
        if (sente_name == '' && gote_name == '' && shogi_title == '') {
            text = '局面図';
        }

        var url = encodeURIComponent(URL);
        window.open('https://twitter.com/share?url=' + url + '&text=' + text, '_blank', 'width=700,height=300');
        void(0);
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

    var board_focus_first = true;
    $('#board').focus(function(e) {
        if (board_focus_first) {
            $('#board')[0].value = '';
            $('#board').css('color', 'black');
            board_focus_first = false;
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
            $('#initial_board_img')[0].src = 'http://' + location.host +'/sfen?sfen=lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
        }
        if ($('#endgame_board_img')[0].src == BLANK) {
            $('#endgame_board_img')[0].src = 'http://' + location.host + '/sfen?sfen=ln1g5%2F1r2S1k2%2Fp2pppn2%2F2ps2p2%2F1p7%2F2P6%2FPPSPPPPLP%2F2G2K1pr%2FLN4G1b%20w%20BGSLPnp%201&lm=52&sname=%E7%BE%BD%E7%94%9F%E5%96%84%E6%B2%BB&gname=%E5%8A%A0%E8%97%A4%E4%B8%80%E4%BA%8C%E4%B8%89&title=%E7%AC%AC38%E5%9B%9E%20NHK%E6%9D%AF%20%E6%BA%96%E3%80%85%E6%B1%BA%E5%8B%9D';
        }
        
        if ($('#tsume_board_img')[0].src == BLANK) {
            $('#tsume_board_img')[0].src = 'http://' + location.host + '/sfen?sfen=1pG1B4%2FGs%2BP6%2FpP7%2Fn1ls5%2F3k5%2FnL4%2Br1b%2F1%2Bp1p%2BR4%2F1S7%2F2N6%20b%20SPgnl11p%201';
        }
        
        $('#example').show('slow');
        $('#example_button')[0].innerHTML = '▲例を隠す';
    } else {
        $('#example').hide('slow');
        $('#example_button')[0].innerHTML = '▼例を見る';
    }
}

function GetSfenPiece(str) {
    var piece_ja2sfen = { '・':''  , '歩':'p' , '香':'l' , '桂':'n' , 
                          '銀':'s' , '金':'g' , '角':'b' , '飛':'r' , 
                          '玉':'k' , 'と':'+p', '杏':'+l', '圭':'+n',
                          '全':'+g', '馬':'+b', '龍':'+r'};
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
    
    if (move_count == 0) { /// 手数の情報がない場合は初手とみなす
        sfen += '1';
    } else {
        sfen += String(move_count);
    }

    return sfen;
}

function update_imgurl(url) {
    IMG_URL = '<img src="' + URL + '">';

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

function BoardConvert(e) 
{
    console.log('BoardConvert() Called:');
    SFEN = Bod2Sfen($('#board')[0].value);
    console.log("sfen:" + SFEN);

    var sfen_encode = encodeURIComponent(SFEN);
    URL = "http://" + location.host + "/sfen?sfen=" + sfen_encode;
    console.log('last_move: ' + $('#last_move').val());
    if ( $('#last_move').val() != '') {
        URL += '&lm=' + $('#last_move').val();
    }

    if ( $('#sente_name').val() != '') {
        URL += '&sname=' + encodeURIComponent($('#sente_name').val());
    }

    if ( $('#gote_name').val() != '') {
        URL += '&gname=' + encodeURIComponent($('#gote_name').val());
    }

    if ( $('#shogi_title').val() != '') {
        URL += '&title=' + encodeURIComponent($('#shogi_title').val());
    }

    console.log('turn_checked:' + $('#turn_check').attr('checked'));

    if ( $('#turn_check').attr('checked') == 'checked') {
        URL += '&turn=off';
    }
    URL += '&piece=' + $('input[name=piece]:checked').val() ;

    update_imgurl(URL);
    $('#long_url').val(URL);
    $('#sfen').val(SFEN);
    $('#blog_code').val(IMG_URL);
    $('#sfen_preview')[0].src = URL;
    $('#board_result').show("slow");

    $('#blog_code')[0].select();
}
