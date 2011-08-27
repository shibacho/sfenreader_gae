// -*- coding: utf-8 -*-
//
// create_board.js Copyright 2011 fantakeshi.
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

$(document).ready(function(){
    var shogi_board = new ShogiBoard();
    var piece_images = new PieceImages();
    var number_images = new NumberImages();
    var $board = $('#board');
    var board_canvas = new BoardCanvas($board[0], shogi_board, 
                                       piece_images, number_images);
    if (!$board || !$board[0].getContext) {
        return;
    }

    $board.mousemove(function (evt) {
        return board_canvas.onMouseMove(evt, board_canvas);
    });
    $board.mouseover(function (evt) {
        return board_canvas.onMouseOver(evt, board_canvas);
    });
    $board.click(function (evt) {
        return board_canvas.onClick(evt, board_canvas);
    });
    $board.dblclick(function (evt) {
        evt.preventDefault();
        return board_canvas.onDoubleClick(evt, board_canvas);
    });

    board_canvas.onBoardChange = function() {
        var sfen;
        console.log('turn value:' + $('input[name=turn]:checked').val());
        if ($('input[name=turn]:checked').val() == 'b') {
            sfen = shogi_board.getSFENString(shogi_board.BLACK);
        } else {
            sfen = shogi_board.getSFENString(shogi_board.WHITE);
        }

        var black_name = board_canvas.getBlackName();
        var white_name = board_canvas.getWhiteName();
        var title = board_canvas.getTitle();
        
        var sfen_encode = encodeURIComponent(sfen);
        var url = 'http://' + location.host + '/sfen?sfen=' + sfen_encode;

        var lm = $('#last_move').val();
        if (lm != '') {
            url += '&lm=' + lm;
        }

        if (typeof black_name != 'undefined' && black_name != '') {
            url += '&sname=' + encodeURIComponent(black_name);
        }

        if (typeof white_name != 'undefined' && white_name != '') {
            url += '&gname=' + encodeURIComponent(white_name);
        }

        if (typeof title != 'undefined' && title != '') {
            url += '&title=' + encodeURIComponent(title);
        }

        if ( $('#turn_check').attr('checked') == 'checked') {
            url += '&turn=off';
        }

        var img_url = 'img src="' + url + '"';

        $('#long_url').val(url);
        $('#sfen').val(sfen);

        img_url = '<' + img_url + '>';
        $('#blog_code').val(img_url);

        SetBoardString(shogi_board);
    };

    var rot_canvas = $('#rot_canvas')[0];
    var rot_ctx = rot_canvas.getContext('2d');
    rot_ctx.save();

    console.log('width:' + board_canvas.CANVAS_WIDTH + 
                ' height:' + board_canvas.CANVAS_HEIGHT);

    $board[0].width = board_canvas.CANVAS_WIDTH;
    $board[0].height = board_canvas.CANVAS_HEIGHT;

    $('#sente_name').change(function(evt) {
        board_canvas.drawBlackName($('#sente_name').val());
        board_canvas.drawAll();
        SetBoardString(shogi_board);
    });

    $('#gote_name').change(function(evt) {
        board_canvas.drawWhiteName($('#gote_name').val());
        board_canvas.drawAll();
        SetBoardString(shogi_board);
    });

    $('#shogi_title').change(function(evt) {
        board_canvas.drawTitle($('#shogi_title').val());
        board_canvas.drawAll();
    });

    $('input[name=turn]').change(function(evt) {
        board_canvas.onBoardChange();
    });

    $('#turn_check').change(function(evt) {
        board_canvas.onBoardChange();
    });

    $('#last_move').change(function(evt) {
        board_canvas.onBoardChange();
    });

    $('#ponanza_analysis').click(function (e) {
        var text = '@ponanza_shogi ';
        text += encodeURIComponent($('#sfen').val());
        window.open('https://twitter.com/share?url=&text=' + text, '_blank', 'width=700,height=300');
    });

    $('#tweet').click(function(e) {
        var url = $('#long_url').val();
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

        url = encodeURIComponent(url);
        text = encodeURIComponent(text);
        window.open('https://twitter.com/share?url=' + url + '&text=' + text, '_blank', 'width=700,height=300');
    });


    shogi_board.initEvenGame();
    board_canvas.onBoardChange();
    
    /// 全ての読み込みが完了した後に描画する
    number_images.initImages();
    piece_images.initImages(function () { 
        board_canvas.drawPieces();
	$('#indicator').css('display', 'none');
    });
});

function SetBoardString(shogi_board) {
    var black_name = $('#sente_name').val();
    var white_name = $('#gote_name').val();
    var board_string = '';

    if (white_name != '') {
        board_string += '後手：' + white_name + '\n';
    }

    board_string += shogi_board.getBoardString();

    if (black_name != '') {
        board_string += '先手：' + black_name + '\n';
    }


    $('#board_text').val(board_string);
    
}
