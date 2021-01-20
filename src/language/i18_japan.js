/**
 * 拓课日文语言包
 * @module japanLanguage
 * @description   提供 拓课日文语言包
 * @author 王力民
 * @date 2018/10/29
 */

const japanLanguage =  {
    "login":{
        "language":{
            "joinRoomHint":{
                "text":"入室中"
            },
            "preLoad":{
                "text":"教材アップロード中",
                "pass":"ジャンプ"
            },
            "detection":{
                "company":{
                    "text":"日本村" ,
                    "normal":"日本村" ,
                    "icoachu":"icoachU　英語学習アプリ"
                },
                "selectOption":{
                    "noCam":"カメラが検出できません" ,
                    "noMicrophone":"マイクが検出できません" ,
                    "noEarphones":"ヘッドフォン、スピーカーが検出できません"
                },
                "welAll":{
                    "one":"ようこそ" ,
                    "two":"オンライン教室" ,
                    "three":"授業の効果を高めるためにデバイステストをしてください" ,
                    "four":"テスト開始"
                } ,
                "deviceTestHeader":{
                    "device":{
                        "text":"デバイステスト"
                    } ,
                    "areaSwitch":{
                        "text":"エリアの変更"
                    },
                    "deviceSwitch":{
                        "text":"デバイスの変更"
                    },
                    "optimalServer":{
                        "text":"最適なネットワーク"
                    },
                    "areaSelection":{
                        "text":"エリアの選択"
                    },
                    "videoinput":{
                        "text":"ビデオテスト"
                    }  ,
                    "audioouput":{
                        "text":"スピーカーテスト"
                    }  ,
                    "audioinput":{
                        "text":"マイクテスト"
                    },
                    "detectionResult":{
                        "text":"テスト結果"
                    },
                    "changeScreen":{
                        "text":"デュアルスクリーン設定"
                    },
                    "MainMinorChange":{
                        "text":"メインウィンドウとサブウィンドウの切り替"
                    },
                    "systemInfo":{
                        "text":"え"
                    },
                },
                "networkExtend":{
                    "title":{
                        "select":"選択",
                        "area":"エリア",
                        "delay":"遅延",
                        "text":"一番近い位置のサーバーを選んでください",
                    },
                    "testBtn":"サーバー遅延テスト"
                },
                "videoinputExtend":{
                    "cameraOptionAll":{
                        "cameraOption":{
                            "text":"カメラオプション"
                        },
                        "noticeRed":{
                            "text":"注意：使用禁止を選ぶとカメラが使えなくなります"
                        }
                    } ,
                    "noticeCarmera":{
                        "one":"ヒント：ビデオが見えないときは、次の手順でチェックしてください" ,
                        "two":"1．ウイルス対策ソフト（360卫士，百度卫士など）のポップアップがあれば、許可を選んでください；" ,
                        "three":"．カメラが接続されてオンになっているか確認してください；" ,
                        "four":"3．カメラに画像がまだ映らないときは別のジャックにカメラを接続しなおしてください；" ,
                        "five":"4．カメラのオプションを正しく選んでください、使用禁止を選択するとカメラが使えなくなります；" ,
                        "six":"5．カメラが他のプログラムで使われていないか確認してください；" ,
                        "seven":"6．コンピュータを再起動してください。"
                    }
                },
                "audioouputExtend":{
                    "cameraOptionAll":{
                        "cameraOption":{
                            "text":"ヘッドフォンオプション"
                        },
                        "earphoneVolume":{
                            "text":"ヘッドフォン音量"
                        },
                        "clickmusic":{
                            "one":"下の再生ボタンをクリックしてください、音声が聞こえますか？"
                        },
                        "playMusic":"音声を再生"
                    } ,
                    "noticeCarmera":{
                        "one":"ヒント：音声が聞こえないときは、次の手順でチェックしてください" ,
                        "two":"1．ウイルス対策ソフト（360卫士，百度卫士など）のポップアップがあれば、許可を選んでください；" ,
                        "three":"2．携帯、スピーカーが接続されてオンになっているか確認してください；" ,
                        "four":"3．ヘッドフォン、スピーカーの音量が最大になっていますか；" ,
                        "five":"4．ヘッドフォンのオプションを正しく選んでください、使用禁止を選択するとヘッドフォン、スピーカーが使えなくなります；" ,
                        "six":"5．ヘッドフォン、スピーカーの音声がまだ検出できないときは、別のジャックにヘッドフォン、スピーカーを接続しなおしてください；" ,
                        "seven":"6．コンピュータを再起動してください。"
                    }
                },
                "audioinputExtend":{
                    "cameraOptionAll":{
                        "cameraOption":{
                            "text":"マイクを選んでください"
                        },
                        "noticeRed":{
                            "text":"マイクのオプションを正しく選んでください、使用禁止を選択するとマイクが使えなくなります"
                        },
                        "speakSound":{
                            "text":"マイクに向かって1から10まで数えてください、自分の声が聞こえ緑色の線が動きますか？"
                        }
                    } ,
                    "noticeCarmera":{
                        "one":"ヒント：緑色の線が動かない場合は次の手順でチェックしてください" ,
                        "two":"1．ウイルス対策ソフト（360卫士，百度卫士など）のポップアップがあれば、許可を選んでください；",
                        "three":"2．マイクが接続されてオンになっているか確認してください；" ,
                        "four":"3．マイクがコンピューターのマイクジャックに差し込まれ、音量が最大になっているか確認してください；" ,
                        "five":"4．マイクのオプションを正しく選んでください、使用禁止を選択するとマイクが使えなくなります；" ,
                        "six":"5．マイクの音声がまだ検出できないときは、別のジャックにマイクを接続しなおしてください；" ,
                        "seven":"6．コンピュータを再起動してください。"
                    },
                },
                "systemInfo":{
                    "currentUser":"ユーザー：",
                    "operatingSystem":"システム操作：",
                    "processor":"プロセッサー：",
                    "RAM":"メモリ：",
                    "serverName":"サーバー名：",
                    "IPAddress":"IPアドレス：",
                    "LoginDevice":"ログインデバイス：",
                    "MediaServer":"メディアサーバー：",
                    "CoursewareServer":"コースウェアサーバー：",
                    "networkDelay":"ネットワーク遅延：",
                    "packetLoss":"パケットロス率：",
                    "browser":"ブラウザ：",
                    "uploadSpeed":"アップロード速度：",
                    "downloadSpeed":"ダウンロード速度：",
                    "roomNumber":"教室番号：",
                    "versionNumber":"バージョンナンバー：",
                },
                "CoursewareServer":{
                    "TkServer":"日本村サーバー",
                    "DocServer":"スピードサーバー",
                },
                "resultExtend":{
                    "head":{
                        "text":"テスト完了"
                    },
                    "item1":{
                        "text":"テスト項目"
                    },
                    "item2":{
                        "text":"テスト結果",
                        "content":{
                            "abnormal":"異常",
                            "normal":"正常",
                        }
                    },
                    "item3":{
                        "text":"検査の詳細",
                        "content":{
                            "video":"カメラが検出されません",
                            "listen":"「音声が聞こえない」を選択しました",
                            "speak":"波形が見えない」を選択しました",
                        }
                    },
                    "item4":{
                        "content":{
                            "video":"ビデオが見えます",
                            "listen":"音声が聞こえます",
                            "speak":"マイクが見えます",
                        }
                    },
                },
                "button":{
                    "next":{
                        "text":"次の手順"
                    } ,
                    "join":{
                        "text":"参加する"
                    },
                    "ok":{
                        "text":"OK"
                    },
                    "startNetworkTest":{
                        "text":"ネットワークテストの開始"
                    },
                    "canSee":{
                        "text":"見える"
                    },
                    "notSee":{
                        "text":"見えない"
                    },
                    "canListen":{
                        "text":"聞こえる"
                    },
                    "notListen":{
                        "text":"聞こえない"
                    },
                    "canSpeak":{
                        "text":"波形が見える"
                    },
                    "notSpeak":{
                        "text":"波形が見えない"
                    },
                    "checkBack":{
                        "text":"再テスト"
                    },
                    "joinRoom":{
                        "text":"教室に入る"
                    }
                },
                "mirrorMode":{
                    "text":"ミラーモード"
                }
            }
        }
    },
    "header":{
        "tool":{
            "allStepDown":{
                "title":{
                    "yes":"全ステップアップ" ,
                    "no":"全ステップダウン"
                }
            } ,
            "allMute":{
                "title":{
                    "yes":"全ミュート解除" ,
                    "no":"全ミュート"
                }
            } ,
            "capture":{
                "title":{
                    "all": "教室スクリーンキャプチャ" ,
                    "small": "デスクトップスクリーンキャプチャ",
                }
            } ,
            "qrCode":{
                "title":{
                    "yes":"スキャン画像アップロード"
                }
            } ,
            "allGift":{
                "title":{
                    "yes":"全員にトロフィーを贈る",
                    "giftText":"全員にギフトを贈る"
                }
            } ,
            "blackBoard":{
                "title":{
                    "open":"ホワイトボード" ,
                    "close":"閉じる" ,
                    "prev":"前の人" ,
                    "next":"次の人" ,
                    "shrink":"縮小" ,
                },
                "content":{
                    "blackboardHeadTitle":"ホワイトボード" ,
                },
                "toolBtn":{
                    "dispenseed":"配布" ,
                    "recycle":"回収" ,
                    "againDispenseed":"再配布" ,
                    "commonTeacher":'先生' ,
                },
                "tip":{
                    "saveImage":"ホワイトボードを保存しますか"
                },
                'boardTool':{
                    "pen":"ペン" ,
                    "text":"文字" ,
                    "eraser":"消しゴム" ,
                    "color":"色と太さ" ,
                }
            } ,
            "sharing":{
                "title":"スクリーン共有"
            } ,
            "mouse":{
                "title":"マウス"
            } ,
            "pencil":{
                "title":"鉛筆" ,
                "pen":{
                    "text":"ペン"
                },
                "Highlighter":{
                    "text":"蛍光ペン"
                },
                "linellae":{
                    "text":"線"
                },
                "arrow":{
                    "text":"矢印"
                },
                "laser":{
                    "title":"レーザーペン" ,
                    "text":"レーザーペン"
                },
            } ,
            "text":{
                "title":"文字" ,
                "Msyh":{
                    "text":"Microsoft　Yahei"
                } ,
                "Ming":{
                    "text":"宋体"
                } ,
                "Arial":{
                    "text":"Arial"
                },
            },
            "shape":{
                "title":"形状" ,
                "outlinedRectangle":{
                    "text":"長方形（塗りつぶしなし）"
                } ,
                "filledRectangle":{
                    "text":"長方形"
                } ,
                "outlinedCircle":{
                    "text":"楕円（塗りつぶしなし）"
                } ,
                "filledCircle":{
                    "text":"楕円"
                },
            },
            "eraser":{
                "title": "消しゴム",
            } ,
            "undo":{
                "title":"キャンセル"
            },
            "redo":{
                "title":"元に戻す"
            } ,
            "clear":{
                "title":"クリア"
            } ,
            "tool_zoom_big":{
                "title":"拡大"
            },
            "tool_zoom_small":{
                "title":"縮小"
            },
            "tool_rotate_left":{
                "title":"反時計回り"
            },
            "tool_rotate_right":{
                "title":"時計回り"
            },
            "colorAndMeasure":{
                "title":"色と太さ" ,
                "selectColorText":"色を選ぶ" ,
                "selectMeasure":"太さを選ぶ"
            }
        },
        "page":{
            "prev":{
                "text":"前のページ"
            } ,
            "next":{
                "text":"次のページ"
            } ,
            "add":{
                "text":"ページを追加する"
            } ,
            "lcFullBtn":{
                "title":"描画領域全画面"
            },
            "pptFullBtn":{
                "title":"PPT全画面"
            },
            "h5FileFullBtn":{
                "title":"h5教材全画面"
            },
            "skipPage":{
                "text_one":"にスキップ" ,
                "text_two":"ページ"
            } ,
            "ok":{
                "text":"OK"
            },
            "coursewareRemarks":{
                "title":"教材備考"
            },
        },
        "system":{
            "attend":{
                "text":"授業開始"
            } ,
            "oneToOneFinsh":{
                "text":"授業終了"
            } ,
            "Raise":{
                'hashand':'有人举手',
                "text":"挙手する" ,
                "noText":"挙手をキャンセル" ,
                "yesText":"挙手" ,
                "raisingHand":"挙手中"
            },
            "finish":{
                "text":"授業終了"
            },
            "gift":{
                "text":"全員にトロフィーを贈る"
            },
            "muteAll":{
                "text":"全ミュート"
            },
            "help":{
                "title":"ヘルプ"
            },
            "network":{
                "title":"ネットワーク" ,
                "extend":{
                    "ChinaTelecom":"中国電信（チャイナテレコム）" ,
                    "ChinaUnicom":"中国聯通（チャイナユニコム）" ,
                    "ChinaMobile":"中国移動（チャイナモバイル）" ,
                    "InternationalNetwork":"インターナショナルネットワーク" ,
                    "ChinaSouthernTelecom":"中国南方電信（チャイナサザンテレコム）"
                }
            } ,
            "setting":{
                "title":"設定"
            }
        },
        "volume":{
            "title":"ボリューム"
        },
        "ControlPanel":{
            "operation":"操作"
        }
    } ,
    "toolContainer":{
        "toolIcon":{
            "whiteBoard":{
                "title":"ホワイトボード"
            },
            "courseList":{
                "title":"教材リスト　またはコースリスト"
            },
            "classFolder":{
                "title":"教室フォルダ"
            },
            "adminFolders":{
                "title":"公共フォルダ"
            },
            "documentList":{
                "title":"教材ファイル" ,
                "titleTop":"教材リスト" ,
                "titleSort":"並べ替え" ,
                "button":{
                    "addCourse":{
                        "text":" + 教材を追加"
                    },
                    "fileName":{
                        "text":"ファイルネーム"
                    },
                    "fileType":{
                        "text":"ファイルタイプ"
                    },
                    "uploadTime":{
                        "text":"アップロード時刻"
                    },
                    "search":{
                        "name":"検索",
                        "text":"検索内容を入力してください",
                    },
                    "close":{
                        "text":"閉じる",
                    }
                }
            },
            "H5DocumentList":{
                "title":"教材ファイル" ,
                "titleTop":"教材リスト" ,
                "button":{
                    "addCourse":{
                        "text":" + h5教材を追加"
                    }
                }
            },
            "mediaDocumentList":{
                "title":"メディアライブラリー" ,
                "titleTop":"メディアリスト" ,
                "button":{
                    "addCourse":{
                        "text":" + メディアを追加"
                    }
                }
            },
            "moviesSharing":{
                "title":"メディアを共有" ,
            },
            "resourceLibrary":{
                "title":"リソースライブラリー" ,
            },
            "message": {
                "title": "ニュース",
            },
            "full": {
                "title": "全画面",
            },
            "fullOff": {
                "title": "全画面から退出する",
            },
            "overallControl":{
                "title":"全体的なコントロール" ,
            },
            "screenSharing":{
                "title":"スクリーン共有"
            },
            "messageList":{
                "title":"メッセージリスト"
            },
            "addDocument":{
                "title":"ドキュメント追加"
            },
            "userList":{
                "title":"ユーザーリスト" ,
                "thead":{
                    "facility":"設備",
                    "nick":"ニックネーム",
                    "platform":"プラットフォーム",
                    "camera":"カメラ",
                    "microphone":"マイク",
                    "draw":"承認",
                    "raise":"挙手",
                    "mute":"ミュート",
                    "remove":"削除"
                },
                "button":{
                    "Scrawl":{
                        "on":{
                            "title":"手書きができます"
                        },
                        "off":{
                            "title":"手書きができません"
                        }
                    },
                    "answered":{
                        "on":{
                            "title":"点呼済み",
                        },
                        "off":{
                            "title":"まだ点呼していません"
                        },
                    },
                    "video":{
                        "on":{
                            "title":"ビデオON"
                        },
                        "off":{
                            "title":"ビデオOFF"
                        },
                        "disabled":{
                            "title":"ビデオ使用禁止"
                        }
                    },
                    "update":{
                        "up":{
                            "title":"発言席にいます"
                        },
                        "down":{
                            "title":"発言席にいません"
                        }
                    },
                    "audio":{
                        "on":{
                            "title":"オーディオON"
                        },
                        "off":{
                            "title":"オーディオOFF"
                        },
                        "disabled":{
                            "title":"オーディオ使用禁止"
                        }
                    },
                    "mute":{
                        "on":{
                            "title":"ミュート"
                        },
                        "off":{
                            "title":"ミュート解除"
                        }
                    },
                    "remove":{
                        "title":"削除"
                    }
                },
                "input":{
                    "text":"ネットワーク確認"
                },
                "userStatus":{
                    "assistant":{
                        "text":"助教"
                    },
                    "student":{
                        "text":"学生"
                    }
                },
            },
            "disableVideo":{
                "yes":"ビデオON" ,
                "no":"ビデオOFF"
            },
            "disableAudio":{
                "yes":"オーディオON" ,
                "no":"オーディオOFF"
            },
            "setting":{
                "title":"設定"
            },
            "help":{
                "title":"ヘルプ"
            },
            "seekHelp":{
                "title":"ヘルプを見る"
            },
            "FileConversion":{
                "text":"ファイルを変換中"
            }
        }
    } ,
    "videoContainer":{
        "videoIcon":{
            "camera":{
                "title":"カメラ"
            } ,
            "microphone":{
                "title":"マイク"
            }
        },
        "sendMsg":{
            "inputText":{
                "placeholder":"送信ボタンを押してメッセージを送る",
                "patrolPlaceholder": "巡視はメッセージを送信できません",
                "frequently":"メッセージが多すぎます、しばらくしてから送信してください",
            } ,
            "btn":{
                "title":{
                    "banChat":"チャット禁止",
                    "allChat":"チャット禁止の取り消し",
                    "sendImg":"画像を送る",
                    "sendEmotion":"絵文字を送る",
                }
            },
            "repeatSpeak":{
                "text":"チャット欄を更新しないでください"
            },
            "sendBtn":{
                "text":"送付" ,
                "title":"メッセージを送る"
            },
            "tap":{
                "chat":"チャット",
                "question":"質問する",
                "users":"ユーザーリスト",
                "doc":"ドキュメント",
                "refresh":"更新"
            },
            "tips":{
                "online":"オンライン",
                "goback":"戻る",
                "pics":"人",
                "private":"プライベートチャット",
                "teacher":"先生",
                "assistant":"助教",
                "student":"学生",
                "patrol":"巡回",
                "me":"わたし",
                "join":"入室する！",
                "leave":"教室を出る！",
                "beforeClass":"授業開始前",
                "afterClass":"授業終了",
                "whiteBoard":"授業開始前です、表示するものがありません",
                "openAllBans": "発言禁止",
                "closeAllBans": "発言禁止の取り消し",
            },
            "filter":{
                "quizobj":"先生にだけ質問する",
                "seeQuiz":"自分の質問だけ見る",
                "seeChat":"先生のチャットだけ見る",
                "seeAnswer":"自分の答えだけ見る"
            }
        },
        "download":{
            "downloadFile":{
                "title":"ダウンロード"
            },
            "downloadFailMessage":{
                "title":"ダウンロード失敗！"
            },
        }
    },
    "otherVideoContainer":{
        "videoIcon":{
            "microphone":{
                "title":"マイク"
            } ,
            "userUpdate":{
                "title":"ビデオをリリースする"
            },
            "userPen":{
                "title":"手書き"
            }
        },
        "button":{
            "scrawl":{
                "yes":"承認" ,
                "no":"承認取り消し"
            } ,
            "platform":{
                "yes":"発言席に入る" ,
                "no":"発言席から出る"
            } ,
            "audio":{
                "yes":"オーディオON" ,
                "no":"オーディオOFF"
            } ,
            "video":{
                "yes":"ビデオON" ,
                "no":"ビデオOFF"
            } ,
            "gift":{
                "yes":"ギフトを贈る"
            } ,
            "close":{
                "yes":"閉じる"
            } ,
            "restoreDrag":{
                "text":"元の位置に戻す"
            },
            "allPlatformDown":{
                "yes":"全ステップダウン"
            } ,
            "allMute":{
                "yes":"全ミュート"
            } ,
            "videoStatusChairman":{
                "yes":"ビデオON" ,
                "no":"ビデオOFF"  ,
                "text":"ビデオOFF"
            } ,
            "audioStatusChairman":{
                "yes":"オーディオON"  ,
                "no":"オーディオOFF"  ,
                "text":"オーディオOFF"
            },
            'areaExchange': {
                'text': 'エリア変更',
            } ,
            "oneKeyReset":{
                'text': 'リセットする',
            },
            "onlyAudio":{
                'no': 'オーディオ承認',
                'yes': 'ビデオ承認',
                'create': 'オーディオインタラクション授業モードに変更しますか',
                'cancel': 'ビデオインタラクション授業モードに変更しますか'
            },
            "pointerReminder":{
                'text':'ポインター',
            },
        },
        "prompt":{
            "text":"当該学生はホームボタンを押しました",
            "userText":"当該ユーザーはホームボタンを押しました"
        },
    },
    "alertWin":{
        "login":{
            "register":{
                "roomEmpty":{
                    "text":"ユーザー名と教室ナンバーは必須です！"
                },
                "eventListener":{
                    "accessDenied":{
                        "text":"カメラとマイクのアクセスが許可されていません！"
                    },
                    "errorRoom":{
                        "text":"入室エラー！"
                    } ,
                    "errorMedia":{
                        "text":{
                            "one":"メディアサーバー接続エラー," ,
                            "two":"，もう一度接続してください。"
                        }
                    },
                    "roomClosed":{
                        "text":{
                            "one":"教室 '" ,
                            "two":"' サーバーによって強制終了されました。"
                        }
                    },
                    "roomDelClassBegin":{
                        "text":"この授業は終了しました！"
                    },
                    "lostConnection":{
                        "text":{
                            "one":"教室の接続が途切れました：" ,
                            "two":"，接続し直してください！"
                        },
                        "ok":{
                            "text":"再接続しました"
                        } ,
                        "title":{
                            "text":"接続エラー"
                        }
                    },
                    "participantEvicted":{
                        "roleConflict":{
                            "text":"同じ識別情報を持つユーザーが入室したため、教室から退出させられました！"
                        } ,
                        "kick":{
                            "text":"先生に退出させられました！"
                        },
                        "noJoin":{
                            "text": "教室から退出させられました、3分後に入室してください"
                        }
                    },
                    "broadcastClass":{
                        "roleChairman":{
                            "text":"この教室はライブ配信用です、ユーザーサイトから入室してください！"
                        }
                    }
                }
            },
            "func":{
                "checkMeetingBeyond":{
                    "chairmanBeyond":{
                        "text":"ほかの先生が入室したので、退出させられました！"
                    } ,
                    "studentBeyond":{
                        "text":"ほかの学生が入室したので、退出させられました！"
                    }
                } ,
                "checkMeeting":{
                    "status_minus_1":{
                        "text":"教室情報取得エラー！"
                    } ,
                    "status_3001":{
                        "text":"サーバー期限切れ！"
                    } ,
                    "status_3002":{
                        "text":"会社がフリーズされています！"
                    } ,
                    "status_3003":{
                        "text":"教室が削除されたか期限切れ！"
                    } ,
                    "status_4007":{
                        "text":"教室が存在しません！"
                    } ,
                    "status_4008":{
                        "text":"教室のパスワードが違います！"
                    } ,
                    "status_4110":{
                        "text":"この教室はパスワードが必要です、入力してください！"
                    } ,
                    "status_4109":{
                        "text":"認証されません！"
                    } ,
                    "status_4103":{
                        "text":"教室定員オーバー！"
                    } ,
                    "status_4112":{
                        "text":"企業ポイントがオーバーしています！"
                    } ,
                    "status_defalut":{
                        "text":"教室情報取得エラー！"
                    }
                }

            }
        },
        "call":{
            "prompt":{
                "noLogin":{
                    "text":"入室にはログインが必要です。ログイン後再度入室してください！"
                } ,
                "noAudioFacility":{
                    "text":"オーディオデバイスがないので授業ができません"
                },
                "chat":{
                    "literally":{
                        "yes":{
                            "text":"手書き機能ON"
                        } ,
                        "no":{
                            "text":"手書き機能OFF"
                        }
                    }
                },
                "publishStatus":{
                    "stream":{
                        "yes_status_3":{
                            "text":"発言席にいます"
                        } ,
                        "no_status_0":{
                            "text":"発言席にいません"
                        },
                        "yes_status_0_to_2":{
                            "text":"発言席にいますが、音声がOFFです"
                        } ,
                        "yes_status_3_to_2":{
                            "text":"オーディオがOFFです、必要なら挙手ボタンをクリックしてください"
                        },
                        "videooff":{
                            "text":"ビデオOFF"
                        },
                        "audiooff":{
                            "text":"音声OFF"
                        },
                        "audioon":{
                            "text":"オーディオON"
                        },
                        "videoon":{
                            "text":"ビデオON"
                        },
                        "allon":{
                            "text":"ビデオ・オーディオの権限を取得済みです"
                        },
                        "alloff":{
                            "text":"ビデオ・オーディオの権限が取り消されています"
                        },
                        "speakoff":{
                            "text":"発言禁止されています"
                        },
                        "speakon":{
                            "text":"発言禁止の取り消し"
                        },
                    },
                    "download":{
                        'success':{
                            "text":"ダウンロード済み！"
                        },
                        "failed":{
                            "text":"ダウンロード失敗！"
                        }
                    },
                    "allMute":{
                        "yes":{
                            "text":"全員ミュート"
                        },
                        "no":{
                            "text":"全員ミュート解除"
                        }
                    }
                },
                "joinRoom":{
                    "stream":{
                        "join":{
                            "text":"入室エラー"
                        },
                        "leave":{
                            "text":"退出"
                        }
                    }
                },
                "allSilence":{
                    "yes":{
                        "text":"ミュート"
                    },
                    "no":{
                        "text":"ミュート解除"
                    }
                },
                "homeBtnRemind":{
                    "join":{
                        "text":"通常モードに戻す"
                    },
                    "leave":{
                        "text":"バックグラウンドモードにする"
                    },
                    "userBackgroundMode":{
                        "text":"該当学生のアプリケーションはバックグラウンドモードなので、ステージに入れません"
                    }
                },
                "streamConnectFailed":{
                    "onceSuccessed":{
                        "text":"ネットワークに問題発生、ネット環境を確認して、入りなおしてください"
                    },
                    "notSuccess":{
                        "text":"あなたのネットワークはUDPをサポートしていません、ファイアーウォールをOFFにしてください"
                    },
                },
                "remoteStreamFailure":{
                    "udpNotOnceSuccess": {
                        "one":"ファイアウォールが原因で、ユーザー（" ,
                        "two":"）サーバー間のUDP通信が確立できません。" ,
                    },
                    "udpMidwayDisconnected": {
                        "one":"ユーザー（" ,
                        "two":"）サーバー間のUDP通信に問題があります" ,
                    },
                    "publishvideoFailure_notOverrun": {
                        "one":"ユーザー（" ,
                        "two":"）サーバー間の通信に問題があります" ,
                    },
                    "publishvideoFailure_overrun":{
                        "one": "教室の発言人数オーバー"
                    },
                    "mobileHome":{
                        "one":"学生" ,
                        "two":"のアプリケーションはバックグラウンド実行されています" ,
                    }
                },
                "releaseFailed": {
                    "text": "ビデオリリースエラー"
                }
            } ,
            "fun":{
                "uploadCourseFile":{
                    "fileTypeError":{
                        "text":{
                            "one": "ファイル形式が違います、この形式はサポートされていません.",
                            "two":"'のファイル！"
                        }
                    },
                    "fileSizeError":{
                        "text":{
                            "one": "ファイルサイズが大きすぎます"
                        }
                    },
                    "fileUpload":{
                        "success":{
                            "text":"アップロード成功、ファイル名は'"
                        },
                        "failureCode":{
                            "text":"番号が違います："
                        },
                        'failureNegativeOne':{
                            "text":"ファイル変換エラー！"
                        },
                        'failureNegativeTwo':{
                            "text":"ファイルアップロードエラー！"
                        },
                        'failureNegativeThree':{
                            "text":"アップロードの場所が違います！"
                        },
                        'failureNegativeFour':{
                            "text":"この形式のファイルはサポートされていません！"
                        },
                        'failureNegativeSeven':{
                            "text":"授業は存在しないか削除されました！"
                        },
                        'failureNegativeEight':{
                            "text":"この授業は当社に帰属しません！"
                        },
                        'failureNegativeTen':{
                            "text":"教材ページ数オーバー！"
                        },
                        'failureFhree':{
                            "text":"クラウド保存エラー！"
                        },
                        'failureFour':{
                            "text":"エラー：ファイルにindex.htmlが抜けています！"
                        },
                    }
                },
                "deleteCourseFile":{
                    "fileDelete":{
                        "failure":{
                            "text":"ファイル削除失敗！"
                        }
                    },
                    "isDel":"本当に削除しますか？"
                },
                "page":{
                    "pageInteger":{
                        "text":"ページ数は整数で入力してください！"
                    } ,
                    "pageMax":{
                        "text":"最大ページ数を超えないページ数を入力してください！" ,
                    },
                    "pageMin":{
                        "text":"ページ数は1以上の数字を入力してください"
                    }
                },
                "file":{
                    "mediaFile":{
                        "text":"メディアの再生エラー！"
                    },
                    "pptFile":{
                        "text":"アニメーションPPTの再生エラー！"
                    }
                } ,
                "video":{
                    "max":{
                        "text":"ビデオの最大チャンネル数を超えています、授業の出席者数を確認してください！"
                    }
                },
                "audit":{
                    "title":{
                        "text":"お知らせ:ライブ配信開始前、お待ちください。"
                    },
                    "ended":{
                        "text":"お知らせ:ライブ配信終了、ありがとうございました。"
                    }
                },
                "UnreadMessage":{
                    "text":"未読メッセージ！"
                },
            }
        },
        "ok":{
            "showError":{
                "text":"OK"
            },
            "showPrompt":{
                "text":"OK"
            },
            "showConfirm":{
                "cancel":"キャンセル" ,
                "ok":"OK"
            }
        },
        "title":{
            "showError":{
                "text":"エラーメッセージ"
            },
            "showPrompt":{
                "text":"通知メッセージ"
            } ,
            "showConfirm":{
                "text":"確認メッセージ"
            }
        },
        "settingWin":{
            "settingTitle":{
                "text":"システム設定"
            },
            "default":{
                "text":"初期設定値"
            },
            "communications":{
                "text":"コミュニケーション"
            },
            "settingOk":{
                "text":"応用"
            },
            "settingClose":{
                "text":"キャンセル"
            },
            "videoInput":{
                "text":"ビデオ設備"
            },
            "audioInput":{
                "text":"音声入力設備"
            },
            "audioOutput":{
                "text":"音声出力設備"
            }
        },
        "messageWin":{
            "title":{
                "closeWindow":{
                    "text": "チェックボックス"
                },
                "classBeginEnd":{
                    "text":"授業終了のお知らせ"
                },
                "allGift":{
                    "text":"送信のお知らせ"
                }
            },
            "winMessageText":{
                "closeWindow":{
                    "ok":{
                        "text":"システムを閉じますか！"
                    }
                },
                "classBeginEnd":{
                    "text":"授業を終了しますか？"
                },
                "removeStudent":{
                    "text":"退出させますか？"
                },
                "classBeginEndLocalRecord":{
                    "text":"録画中です、授業終了後録画は自動停止します。ビデオのURLは："
                },
                "classBeginStartNotSelectRecord":{
                    "text":'自動録画はされません、そのまま授業を始めてください。'
                },
                "aloneGift":{
                    "before":"贈りますか" ,
                    "after":"クラスメートからギフトが贈られました？"
                },
                "allGift":{
                    "one":"贈ります" ,
                    "two":"全ての人" ,
                    "three":"ギフト？"
                }
            },
            "messageOk":{
                "text":"OK"
            },
            "messageClose":{
                "text":"キャンセル"
            }
        }
    } ,
    "remind":{
        "time":{
            "readyStart":{
                "one":"授業開始まで、あと" ,
                "two":"あと～分です、準備してください"
            } ,
            "timeoutStart":{
                "one":"時間が過ぎています" ,
                "two":"～分です、すぐに授業を始めてください"
            },
            "endNotBegin":{
                "one":"教室は終了しました、授業に出ませんでしたね！"
            } ,
            "readyEnd":{
                "one":"授業終了まで、あと" ,
                "two":"～分です、適切に時間配分しましょう"
            } ,
            "timeoutReadyEnd":{
                "one":"時間がオーバーしています" ,
                "two":"～分です、教室は間もなく" ,
                "three":"～分後に自動的に閉じられます！"
            },
            "timeoutEnd":{
                "one":"教室は間もなく閉じれらます（" ,
                "two":"’)"
            },
            "endBegin":{
                "one":"教室は終了しました！"
            },
            "readyEndAiBanMa":{
                "one":"分後に授業が終わります," ,
                "two":"秒後に授業が終わります,",
                "three":"適切に時間配分しましょう",
                "four":"教室の終了時刻を過ぎています！"
            } ,
        },
        "button":{
            "remindKnow":{
                "text":"分かりました"
            } ,
            "raise":{
                "yes":"同意" ,
                "no":"同意しない"
            }
        },
        "raise":{
            "content":{
                "text":"クラスメートが挙手しています"
            }
        }
    },
    "publish":{
        "beyondMaxVideo":{
            "text":"発言席の人数がオーバーです!"
        }
    },
    "networkStatus":{
        "rtt":{
            "title":{
                "text":"ネットワーク遅延"
            }
        },
        "packetsLost":{
            "title":{
                "text":"パケットロス率"
            }
        },
        "network":{
            "title":{
                "text":"ネットワーク状況"
            },
            "value":{
                "excellent":'優れている' ,
                "well":'良い' ,
                "general":'普通' ,
                "suck":'劣っている' ,
            }
        },
    },
    "toolCase":{
        "toolBox":{
            "text":"ツールボックス"
        }
    },
    "qrCode":{
        "scan":{
            "text":"コードをスキャンして画像をアップロード"
        },
        "attention":{
            "text":"アップロードされました、ウィンドウを閉じないでください"
        }
    },
    "timers":{
        "timerSetInterval":{
            "text":"タイマー"
        },
        "timerBegin":{
            "text":"開始"
        },
        "timerStop":{
            "text":"一時停止"
        },
        "again":{
            "text":"再開"
        },
        "startNowBtn": {
            "text": "計時を始める"
        }
    },
    "dial":{
        "turntable":{
            "text":"ターンテーブル"
        }
    },
    "answers":{
        "headerTopLeft":{
            "text":"答え発見器"
        },
        "headerMiddel":{
            "text":"文字をクリックして正しい答えを事前に設定してください"
        },
        "beginAnswer":{
            "text":"回答開始"
        },
        "tureAccuracy":{
            "text":"正解率"
        },
        "add":{
            "text":"答えを追加する"
        },
        "reduce":{
            "text":"答えを削除する"
        },
        "people":{
            "text":"人"
        },
        "trueAnswer":{
            "text":"正解"
        },
        "endAnswer":{
            "text":"回答終了"
        },
        "restarting":{
            "text":"再開"
        },
        "myAnswer":{
            "text":"私の答え"
        },
        "changeAnswer":{
            "text":"答えを訂正する"
        },
        "selectAnswer":{
            "text":"答えを一つ以上選んでください"
        },
        "submitAnswer":{
            "text":"答えを提出する"
        },
        "numberOfAnswer":{
            "text":"回答人数"
        },
        "PublishTheAnswer":{
            "text":"正解発表"
        },
        "published":{
            "text":"発表済み"
        },
        "details":{
            "text":"詳細"
        },
        "statistics":{
            "text":"統計"
        },
        "student":{
            "text":"学生"
        },
        "TheSelectedTheAnswer":{
            "text":"選んだ答え"
        },
        "AnswerTime":{
            "text":"所要時間"
        },
        "end":{
            "text":"回答を終了してください"
        },
        "selectedAnswer":{
            "text":"選んだ答え"
        }
    },
    "responder":{
        "responder":{
            "text":"早押しボタン"
        },
        "begin":{
            "text":"早押し開始"
        },
        "restart":{
            "text":"再開"
        },
        "clickTitle":{
            "text":"ボタンを押して早押しを開始する"
        },
        "somebodyTeacher":{
            "text":"早押しをしている人がいます",
        },
        "my":{
            "text":"おめでとう、早押しを制しました"
        },
        "other": {
            "text":"早押し済"
        },
        "inAnswerTitle":{
            "text":"早押し中..."

        },
        "inAnswerBtn": {
            "text":"早押し中"
        },
        "inAnswerStudent":{
            "text":"早押し準備"
        },
        "noContest":{
            "text":"早押しをしている人がいません"
        },
    },
    "shares": {
        "shareSceen": {
            "text": "デスクトップ共有"
        },
        "stopShare": {
            "text": "共有停止"
        },
        "shareing": {
            "text0": "プログラムを共有中......",
            "text1": "エリアを共有中......",
            "text2": "デスクトップを共有中......",
        },
        "sharingMode":{
            "text":"共有停止"
        },
        "programmShare":{
            "text":"プログラム共有"
        },
        "shareArea": {
            "text": "エリア共有"
        },
        "startSharing":{
            "text":"共有開始"
        },
        "selectProgramm":{
            "text":"共有したいプログラムを選んでください"
        },
        "programmShareArea":{
            "text":"＊青い囲みの中が共有範囲です"
        },
        "screenWidthTip": {
            "text": "今の解像度は1080Pを超えています、エリア共有してください！",
        }
    },
    "layoutInfo": {
        "layout": 'レイアウト',
        "CoursewareDown": 'ビデオを上部に表示',
        "VideoDown": 'ビデオを下部に表示',
        "Encompassment": 'ビデオを周囲に表示',
        "Bilateral": 'メイン講師モード',
        "MorePeople": '複数人モード',
        "synStudent": '学生側と同期',
    },
    "phoneBroadcast":{   /*手机直播端语言*/
        "chat":{
            "notClassBegin":{
                "text":"授業前、表示するものがありません"
            },
            "face":{
                "naughty":'いたずら' ,
                "happy":'ハッピー' ,
                "complacent":'得意',
                "curlOnesLips":'への字' ,
                "grieved":'悲しい' ,
                "shedTears":'涙' ,
                "kiss":'キス' ,
                "love":'チュッ' ,
            }
        }
    } ,
    "getUserMedia":{
        "accessAccepted":{
            "getUserMediaFailure_reGetAudio":"ビデオが使用できません、ジャックにきちんと差し込まれているか、ほかのプログラムで使用されていないか確認してください。" , //备注:音视频设备都有，但是视频获取失败，音频获取成功——视频获取失败可能是因为设备占用等
            "getUserMediaFailure_reGetVideo":"オーディオが使用できません、ジャックにきちんと差し込まれているか、ほかのプログラムで使用されていないか確認してください。" //备注:音视频设备都有，但是音频获取失败，视频获取成功
        },
        "accessDenied":{
            "streamFail":"オーディオとビデオが使用できません。カメラ/マイクの設定を確認し、ウイルスソフトを無効にしてください" , //备注:音视频设备至少有一个，但是都获取失败 ， 原因可能性无法确定
            "notAudioAndVideo":"カメラとマイクが検出できません、ジャックにきちんと差し込まれているか、ほかのプログラムで使用されていないか確認してください。" //备注:音视频设备都没有
        }
    },
    "broadcast":{
        "errorHintInfo":"メインキャスターは休憩中、ほかのキャスターを選んでください~"
    },
    "version":{
        "clientDeviceVersionInfo": {
            "key":"ユーザーが使用中のデバイス：" ,
            "client":"ユーザーサイト" ,
            "pc":"パソコン用Webページ" ,
            "mobile":"モバイル用Webページ" ,
        } ,
        "browserVersionInfo":{
            "webpageApp":"ブラウザ：" ,
            "mobileApp":"オペレーティングシステムバージョン：" ,
        },
        "appVersionInfo":{
            "key":"バージョンナンバー：" ,
        },
        "ipInfo":{
            "key":"IPアドレス：" ,
        },
    },
    "quiz": { //提问区语言包
        "ask": "質問",
        "answer": "回答",
        "pass": "パス（合格）",
        "delete": "削除",
        "studentAskRemind" : {
            "part1": "あなたの質問“",
            "part2": "”提出されました、承認を待ってください",
        },
        'onlyTeacher': '先生だけを見る',
        'onlySelf': '自分だけを見る',
        'intervalTips': {
            'part1': 'メッセージが多すぎます',
            'part2': '秒後に試してください',
        }
    },
    'notice': { // 广播、通知、公告语言包
        'notice': 'お知らせ',
        'broadcast': '放送',
        'inform': '通知',
        'content': '内容',
        'href': 'ハイパーテキストの参照',
        'publishNotice': 'お知らせする',
        'publishBroadcast': '放送する',
        'publishInform': '通知する',
        'publish': 'リリース',
        'cancel': 'キャンセル',
    },
    "welcomeClassroom":{
        "text":"授業にようこそ",
        "roomId":"教室ナンバー："
    },
    "vote":{
        "vote": "投票",
        "back": "戻る",
        "close": "閉じる",
        "modification": "変更",
        "publish": "リリース",
        "check": "投票状況を見る",
        "unpub": "リリース前",
        "voting": "投票中",
        "finished": "終了",
        "voteRes": "投票結果",
        "finishVote": "投票終了",
        "voteTips": "問題に答えて、交流に参加し、自分の意見を決めよう、提出すればポップアップウィンドウがみんなに表示されるよ。",
        "startVote": "投票を始める",
        "subject": "テーマ",
        "desc": "説明",
        "type": "タイプ",
        "radio": "単一選択",
        "checkbox": "複数選択",
        "options": "オプション",
        "addOption": "オプションを増やす",
        "cancel": "キャンセル",
        "save": "保存",
        "delete": "削除",
        "voteCommit": "投票する",
        "commit": "提出されました、承認を待ってください",
    },
    "callroll":{
        "callroll": "点呼",
        "signIn": "サインイン",
        "close": "閉じる",
        "tips": "点呼を使って会議サインイン。点呼後ポップアップウィンドウが画面中央に出現します。",
        "setType": "点呼の時間を設定",
        "timerType0": "1分間",
        "timerType1": "3分間",
        "timerType2": "5分間",
        "timerType3": "10分間",
        "timerType4": "30分間",
        "state0": "点呼中",
        "state1": "終了",
        "crTime": "点呼時間",
        "totalNum": "点呼人数：999+",
        "signInNum": "サインイン人数",
    },
    "loadSupernatantPrompt":{
        "reconnecting":"ネットが不安定です、接続を回復しています" ,
        "loadRooming":"教室に接続中" ,
        "loadRoomingPlayback":"再生リリース取得中" ,
        "refreshing":"助教がログインしなおしています、お待ちください" ,
    },
    "remoteControl":{
        "remoteTitle": "リモート管理" ,
        "refresh":"強制リフレッシュ" ,
        "deviceManagement":"設備管理" ,
        "optimalServer":"最適なネットワーク",
        "kick":"退出",
        "getDocAddress": "コースウェアサーバー",
        "line1": "日本村サーバー",
        "line2": "スピードサーバー",
    } ,
    "localRecord":{
        "recordState":{
            "notStart":'レコーディング' ,
            "recording":'レコーディング中' ,
            "recordPaused":'一時停止' ,
        },
        "title":{
            "startRecord":'レコーディング開始' ,
            "stopRecord":'レコーディング停止' ,
            "pauseRecord":'一時停止' ,
            "playRecord":'レコーディング再開' ,
        }
    },
    "coursewareRemarks":{
        "remarks":"備考",
        "close":"閉じる",
    },
    "videLabel":{
        "exit":"退出"
    },
    "captureImg":{
        "StartUploading":"スクリーンキャプチャーをアップロード",
        "UploadSuccess":"アップロード成功",
        "uploadFailed":"ネットワークに問題があります、アップロードエラー",
        "SaveSuccess":"スクリーンキャプチャーは保存されました ",
    },
    "moreUser":{
        "text":"現在ステージ上の学生のみがホワイトボードを使えます！"
    },
    "zhikeToolBar":{
        "toolbar":"ツール",
        "file":"ファイル",
        "move":"移動",
        "pencil":"鉛筆",
        "shape":"形状",
        "color":"色",
        "eraser":"消しゴム",
        "undo":"取り消す",
        "redo":"元に戻す",
        "type":"文字",
        "delete":"削除",
        "treasure":"ツールボックス",
        "setting":"設定",
        "devices":"デバイスの移行",
        "server":"最適なサーバー",
        "videoSetting":"設定",
        "videoCloseCamera":"カメラOFF",
        "videoOpenCamera":"カメラON",
        "cameraClose":"カメラがOFです、お待ちください...",
        "muted":"ミュート",
        "mutedNone":"モニター"
    },
    "zhikeStudentMorePermissions":{
        "yes":"ほかの権限を得る",
        "no":"権限を放棄する"
    },
    "zhikeOpenOrCloseVoice":{
        "open":"オーディオをONにする",
        "close":"オーディオをOFFにする"
    },
    "zhikeFullScreenTip":"ここをクリックして全画面の効果授業を切り替えることができます",
    "zhikeCancelPermission":{
        "text":"申請を取り消す",
        "msg":"外教は確認後にさらに権限が与えられます、お待ちください"
    },
    "zhikeREVOKE":{
        "text":'学生の操作禁止OFFをクリック',
        "stop":"停止"
    },
    "zhikeTeacherMorePermissions":{
        "text": "学生に操作権限を与える",
        "yes":"同意",
        "no":"同意しない"
    },
    "reloadDoucumentHint":{
        "one":"ネットが不安定です、教材を開きなおしています" ,
        "two":"次"
    },
    "qPanel": {
        "answerPanel": '回答パネル',
        "tips":[
            "文字をクリックして正答を設定する",
            "答えを選んでください"
        ],
        "addOption": '答えを追加する',
        "delOption": '答えを削除する',
        "start": '回答する',
        "end": '回答を終了する',
        "restart": '再開',
        "rightOptionIs": "正答は",
        "hasPub": "発表済み",
        "answerNum": "回答者数",
        "people": "人",
        "commitAnswer": "答えを提出する",
        "modifyAnswer": "答えを変更する",
        "detail": "詳細",
        "statistics": "統計",
        "useTime":"所要時間",
        "choseAnswer":"選んだ答え",
        "myAnswer":"私の回答",
        "pubResult":"発表結果",
        "loading":"データーなし",
    },
    "whiteboardSetSize":{
        "lineWidth":"線の太さ",
        "eraserWidth":"消しゴムの大きさ",
        "textWidth":"文字大きさ"
    },
    "fontSize":{
        "number":'番号'
    }
};
export default japanLanguage ;