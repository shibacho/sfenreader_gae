// -*- coding: utf-8 -*-
//
// create_board.js Copyright 2011-2016 shibacho
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
  var AUTHOR = 'sfenreader_gae';
  var HASHTAG = 'CShogiG';  
  var shogi_board = new ShogiBoard();
  var piece_images = new PieceImages();
  var number_images = new NumberImages();
  // var $board = $('#board');
  var board_canvas = new BoardCanvas($('#board')[0], shogi_board,
                                     piece_images, number_images);
  var twttr_factory = undefined; // Twitter factory object
  /// twitter ready function
  twttr.ready(function(twttr) {
    console.info('twitter ready has called:');
    twttr_factory = twttr;
  });

  if (!$('#board') || !$('#board')[0].getContext) {
    return;
  }
  var readParameter = function() {
    var parameter = {};
    var query = window.location.search.substring(1);
    var params = query.split('&');
    for (var i = 0, n = params.length; i < n; i++) {
      var temp = params[i].split('=');
      parameter[temp[0]] = decodeURIComponent(temp[1]);
    }
    return parameter;
  };
  var parameter = readParameter();
  
  var getCurrentQuery = function() {
    var query = {};
    var sfen;
    console.log('turn value:' + $('input[name=turn]:checked').val());
    if ($('input[name=turn]:checked').val() === 'b') {
        sfen = shogi_board.getSFENString(shogi_board.BLACK);
    } else {
        sfen = shogi_board.getSFENString(shogi_board.WHITE);
    }

    var black_name = board_canvas.getBlackName();
    var white_name = board_canvas.getWhiteName();
    var title = board_canvas.getTitle();

    var move_at_val = $('#move_at').val();
    if (move_at_val != '') {
      console.log('move_at_val:' + move_at_val);
      sfen = setSfenMove(sfen, move_at_val);
    }

    var sfen_encode = encodeURIComponent(sfen);
    query['sfen'] = sfen_encode;

    var lm = $('#last_move').val();
    if (lm != '') {
      query['lm'] = lm;
    }

    if (typeof black_name != 'undefined' && black_name != '') {
      query['sname'] = encodeURIComponent(black_name);
    }

    if (typeof white_name != 'undefined' && white_name != '') {
      query['gname'] = encodeURIComponent(white_name);
    }

    if (typeof title != 'undefined' && title != '') {
      query['title'] = encodeURIComponent(title);
    }

    if ( $('#turn_check').prop('checked') == 'checked') {
      query['turn'] = 'off';
    }

    if (move_at_val != '') {
      query['ma'] = 'on';
    }
    return query;
  }

  var getCurrentQueryString = function() {
    var query = getCurrentQuery();
    var query_string = '';
    for (var key in query) {
      console.log('getCurrentQueryString():' + key + '=' + query[key]);
      query_string += key + '=' + query[key] +'&';
    }
    query_string = query_string.substring(0, query_string.length - 1);

    return query_string;
  }

  $('#board')[0].oncontextmenu = function() {
    return false;
  }
  
  var setTurn = function() {
    if ($('input[name=turn]').prop('disabled') === true) {
      console.debug('No turn mark draw')
      shogi_board.setBoardTurn(shogi_board.NOTURN); 
    } else if ($('input[name=turn]:checked').val() === 'b') {
      shogi_board.setBoardTurn(shogi_board.BLACK); 
    } else if ($('input[name=turn]:checked').val() === 'w') {
      shogi_board.setBoardTurn(shogi_board.WHITE); 
    }
  };
  setTurn();

  /// parameter: 
  /// sfen: original sfen
  /// move_count: update number of move count
  /// return value:
  ///   SFEN string of changed number of move count
  var setSfenMove = function(sfen, move_count) {
    token = sfen.split(" ");
    return token[0] + " " + token[1] + " " + token[2] + " " + move_count;
  };

  /// parameter: 
  /// return value:
  ///   dictionary: Tweet infomation
  var getTweetUrl = function() {
    var url = $('#twiimg_url').html();
    var sente_name = $('#sente_name').val();
    var gote_name = $('#gote_name').val();
    var shogi_title = $('#shogi_title').val();
    var text = '';
    var hashtags = HASHTAG;
    var via = AUTHOR;
    if (sente_name !== '' && gote_name !== '') {
        text += sente_name + ' ' +  $('#versus_string').text() + ' ' + gote_name + ':';
    }
    text += shogi_title;

    if (sente_name === '' && gote_name === '' && shogi_title === '') {
        text = $('#board_default_name').text();
    }
    return {url: url, text: text, hash: hashtags, via: via};
  };

  /// Set (or change) board string to be inputted value
  var setBoardString = function(shogi_board) {
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

    // remove and put new tweet button
    var $tweet = $('#tweet');
    var tweet_info = getTweetUrl();
    console.info('tweet_info url:' + tweet_info['url'] + ' text:' + tweet_info['text'] + 
                  ' hashtag:' + HASHTAG + ' via:' + AUTHOR);
    $tweet.html('&nbsp;');
    $tweet.html('<a class="twitter-share-button" href="https://twitter.com/share" data-url="' + 
               tweet_info['url'] + '" data-text="' + tweet_info['text'] + '" data-hashtags="' + 
              HASHTAG + '" data-via="' + AUTHOR + '" data-count="none">Tweet</a>');
    if (twttr_factory) {
      twttr_factory.widgets.load();
    }
  };
  setBoardString(shogi_board);

  $('#board').mousemove(function (evt) {
    return board_canvas.onMouseMove(evt, board_canvas);
  });
  $('#board').mouseover(function (evt) {
    return board_canvas.onMouseOver(evt, board_canvas);
  });
  $('#board').mousedown(function (evt) {
    if (evt.which == 1) { // Left Click
      return board_canvas.onLeftClick(evt, board_canvas);
    } else if (evt.which == 3) { // Right Click
      return board_canvas.onRightClick(evt, board_canvas);
    }
    return false;
  });

  board_canvas.onBoardChange = function() {
    var query = getCurrentQueryString();

    var url = 'http://' + location.host + '/sfen?' + query;
    var twiimg_url = 'http://' + location.host + '/twiimg?' + query;

    var img_url = 'img src="' + url + '"';

    $('#long_url').val(url);
    $('#image_link').attr('href', url);
    $('#twiimg_url').html(twiimg_url);
    $('#sfen').val(decodeURIComponent(getCurrentQuery()['sfen']));

    img_url = '<' + img_url + '>';
    $('#blog_code').val(img_url);

    setBoardString(shogi_board);
  };

  var rot_canvas = $('#rot_canvas')[0];
  var rot_ctx = rot_canvas.getContext('2d');
  rot_ctx.save();

  console.log('width:' + board_canvas.CANVAS_WIDTH +
              ' height:' + board_canvas.CANVAS_HEIGHT);

  $('#board')[0].width = board_canvas.CANVAS_WIDTH;
  $('#board')[0].height = board_canvas.CANVAS_HEIGHT;

  $('#langselect').change(function(evt) {
    var query = getCurrentQueryString(this);
    location.href = 'http://' + location.host + '/' + 
        $('#langselect').val() + '/create_board.html?' + query;
  });

  $('#sente_name').change(function(evt) {
    board_canvas.drawBlackName($('#sente_name').val());
    board_canvas.drawAll();
    setBoardString(shogi_board);
  });

  $('#gote_name').change(function(evt) {
    board_canvas.drawWhiteName($('#gote_name').val());
    board_canvas.drawAll();
    setBoardString(shogi_board);
  });

  $('#shogi_title').change(function(evt) {
    board_canvas.drawTitle($('#shogi_title').val());
    board_canvas.drawAll();
  });

  $('input[name=turn]').change(function(evt) {
    console.debug('changeTurn(): called val():' + $('input[name=turn]:checked').val());
    setTurn();
    board_canvas.drawAll();
    board_canvas.onBoardChange();    
  });

  $('#turn_check').change(function(evt) {
    if ($('#turn_check').prop('checked')) {
      $('input[name=turn]').prop('disabled', true);
    } else {
      $('input[name=turn]').prop('disabled', false);
    }
    setTurn();
    board_canvas.drawAll();
    board_canvas.onBoardChange();
  });

  $('#last_move').change(function(evt) {
    board_canvas.onBoardChange();
  });

  $('#move_at').change(function(evt) {
    board_canvas.onBoardChange();
  });

  // $('#ponanza_analysis').click(function (e) {
  //     var text = '@ponanza_shogi ';
  //     text += encodeURIComponent($('#sfen').val());
  //     window.open('https://twitter.com/share?url=&text=' + text, '_blank', 'width=700,height=300');
  // });
  
  $('#init_board').click(function(evt) {
    shogi_board.setBoardStatusBySfen('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1');
    board_canvas.drawAll();
  });
  
  $('#init_drop_kyo').click(function(evt) {
    shogi_board.setBoardStatusBySfen('1nsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1');
    board_canvas.drawAll();
  });

  $('#init_drop_kaku').click(function(evt) {
    shogi_board.setBoardStatusBySfen('lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1');
    board_canvas.drawAll();
  });
  
  $('#init_drop_hisha').click(function(evt) {
    shogi_board.setBoardStatusBySfen('lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1');
    board_canvas.drawAll();
  });
  
  $('#init_drop_hikyou').click(function(evt) {
    shogi_board.setBoardStatusBySfen('lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1');
    board_canvas.drawAll();
  });
  
  $('#init_drop_nimai').click(function(evt) {
    shogi_board.setBoardStatusBySfen('lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1');
    board_canvas.drawAll();
  });
  
  $('#init_drop_yonmai').click(function(evt) {
    shogi_board.setBoardStatusBySfen('1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1');
    board_canvas.drawAll();
  });
  
  $('#init_drop_rokumai').click(function(evt) {
    shogi_board.setBoardStatusBySfen('2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1');
    board_canvas.drawAll();
  });
  
  $('#init_mate_problem').click(function(evt) {
    shogi_board.setBoardStatusBySfen('8k/9/9/9/9/9/9/9/9 b 2r2b4g4s4n4l18p 1');
    board_canvas.drawAll();
  });
  
  $('#init_by_sfen').click(function(evt) {
    var sfen = 
      window.prompt($('#init_by_sfen_string').html(),
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1');
    if (sfen !== null) {
      if (shogi_board.setBoardStatusBySfen(sfen) === true) {
        board_canvas.drawAll();
      } else { // Maybe SFEN string syntax error
        window.alert($('#init_by_sfen_error_msg').html())
      }
    }
  });

  var flip_alphabet = function(str) {
    var flipped = "";
    for (var i = 0, n = str.length; i < n; i++) {
      if (str[i] === str[i].toUpperCase()) {
        flipped += str[i].toLowerCase();
      } else if (str[i] === str[i].toLowerCase()) {
        flipped += str[i].toUpperCase();
      } else {
        flipped += str[i];
      }
    }
    console.log("flip_alphabet(" + str + ") -> " + flipped);
    return flipped;
  }
  
  /// flip button has clicked
  $('#flip').click(function(evt) {
    var sfen = $("#sfen").val();
    var sfen_array = sfen.split(' ');
    var sfen_board = sfen_array[0]; // pieces on the board
    var sfen_hand  = sfen_array[2]; // hand pieces
    
    var sfen_rows = sfen_board.split('/');
    if (sfen_rows.length != 9) {
      console.log('SFEN on board string is wrong. SFEN:' + sfen);
      return false;
    }
    
    var new_sfen_board_array = new Array();
    for (var i = 0, n = sfen_rows.length; i < n; i++) {
      // Add board rows flipped order
      // Reverse string of flipped order
      var reversed_line = sfen_rows[n - i - 1].split("").reverse().join("");
      new_sfen_board_array.push(flip_alphabet(reversed_line));
    }
    var new_sfen_array = new Array(4);
    new_sfen_array[0] = new_sfen_board_array.join('/');
    new_sfen_array[1] = sfen_array[1];
    new_sfen_array[2] = flip_alphabet(sfen_array[2]);
    new_sfen_array[3] = sfen_array[3];
    
    var new_sfen = new_sfen_array.join(' ');
    
    
    console.log("sfen:" + sfen);
    console.log("flipped_sfen:" + new_sfen);
    shogi_board.setBoardStatusBySfen(new_sfen);
    board_canvas.drawAll();
    return true;
  });
  
  console.log('shogi_board:' + shogi_board);
  console.log('shogi_board.initEvenGame():' + shogi_board.initEvenGame);
  shogi_board.initEvenGame();
  board_canvas.onBoardChange();

  /// Draw board image after all image have loaded
  number_images.initImages();
  piece_images.initImages(function () {
    if (parameter.hasOwnProperty('sfen')) {
      console.log('initImages(): parameter has sfen:' + parameter['sfen']);
      shogi_board.setBoardStatusBySfen(decodeURIComponent(parameter['sfen']));
    }

    if (parameter.hasOwnProperty('sname')) {
      console.log('initImages(): parameter has sname:' + parameter['sname']);
      $('#sente_name').val(decodeURIComponent(parameter['sname']));
      board_canvas.drawBlackName($('#sente_name').val());
    }

    if (parameter.hasOwnProperty('gname')) {
      console.log('initImages(): parameter has gname:' + parameter['gname']);
      $('#gote_name').val(decodeURIComponent(parameter['gname']));
      board_canvas.drawWhiteName($('#gote_name').val());
    }

    if (parameter.hasOwnProperty('title')) {
      console.log('initImages(): parameter has title:' + parameter['title']);
      $('#shogi_title').val(decodeURIComponent(parameter['title']));
      board_canvas.drawTitle($('#shogi_title').val());
    }

    if (parameter.hasOwnProperty('lm')) {
      console.log('initImages(): parameter has lm:' + parameter['lm']);
      $('#last_move').val(decodeURIComponent(parameter['lm']));
    }

    if (parameter.hasOwnProperty('ma') && parameter['ma'] === 'on') {
      console.log('initImages(): parameter has ma:' + parameter['ma']);
      console.log(decodeURIComponent(parameter['sfen']).split(' ')[3]);
      $('#move_at').val(decodeURIComponent(parameter['sfen']).split(' ')[3]);
    }

    setBoardString(shogi_board);
    $('#indicator').css('display', 'none');
    board_canvas.drawAll();
  });
});
