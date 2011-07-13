・SFEN Reader for Google APP Engine.

現在は
http://sfenreader.appspot.com/
で稼働していますが、作者が飽きた時のために設置方法を書いておきます。

----設置の仕方 (Windowsの場合)

1. Google App Engine ( https://appengine.google.com/ ) で
   新しいアプリケーションを作成 (例: myexample)
   以下はmyexample というアプリケーション名を取ったものとして話を進める

2. app.yaml の Application の
   application: sfenreader
   という行のsfenreaderをmyexample に変える

3. Google App Engine Launcher で [File] -> [Add Existing Application]から
   ファイルを展開したフォルダを指定

4. Deploy する

5. myexample.appspot.com にアクセスして表示されればOK
