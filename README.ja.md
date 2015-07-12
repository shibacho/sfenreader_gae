# SFEN Reader for Google App Engine

[English](README.md)

## 概要

Google App Engine 上で将棋の局面図をpng形式で生成するサービスです

現在は
http://sfenreader.appspot.com/
で稼働していますが、作者によるメンテナンスが困難になった時のために
設置の仕方を書いておきます。

## 設置の仕方 (Windowsの場合)

1. Google App Engine ( https://appengine.google.com/ ) で新しいアプリケーションを作成 (例: myexample)。
以下はmyexample というアプリケーション名を取ったものとして話を進める

1. app.yaml の Application のapplication: sfenreader という行のsfenreaderをmyexample に変える

1. Google App Engine Launcher で [File] -> [Add Existing Application]からファイルを展開したフォルダを指定

1. Deploy する

1. myexample.appspot.com にアクセスして表示されればOK
