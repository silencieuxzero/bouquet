/* 悼溯茶馆 · 小剧场与回忆事件
   由 data/data.js 拆分而来（2026-08-02）
   加载顺序：characters → plots-*（各章）→ events → meta */
window.DAOSU_DATA = window.DAOSU_DATA || {};
window.DAOSU_DATA.events = {
 "teahouse_encounter": {
  "script_id": "teahouse_encounter",
  "title": "茶馆雨遇",
  "start_node": "start",
  "characters": [
   "洛疏律"
  ],
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "窗外下起了绵绵细雨，你推开一家老茶馆的木门，暖黄的灯光和淡淡的茶香扑面而来。",
    "emotion": "neutral",
    "next_node": "greeting"
   },
   "greeting": {
    "speaker": "洛疏律",
    "text": "（抬头看了你一眼，又低头继续写着什么）啊……欢迎。茶单在桌上，自己看就好。",
    "emotion": "neutral",
    "choices": [
     {
      "text": "你在写什么？",
      "next_node": "ask_notebook",
      "option_id": "curious",
      "affection_change": 2
     },
     {
      "text": "来一壶蜂蜜柚子茶。",
      "next_node": "order_tea",
      "option_id": "same_taste",
      "affection_change": 3
     },
     {
      "text": "一个人坐角落。",
      "next_node": "sit_alone",
      "option_id": "keep_distance",
      "affection_change": 0
     }
    ]
   },
   "ask_notebook": {
    "speaker": "洛疏律",
    "text": "（合上笔记本，露出有些不好意思的表情）只是随便记一些想法……没什么特别的。",
    "emotion": "neutral",
    "next_node": "small_talk"
   },
   "order_tea": {
    "speaker": "洛疏律",
    "text": "（终于放下笔，微微抬眼）蜂蜜柚子茶？好品味……这也是我最喜欢的。",
    "emotion": "happy",
    "next_node": "small_talk"
   },
   "sit_alone": {
    "speaker": "narrator",
    "text": "你在靠窗的位置坐下，雨滴顺着玻璃滑落。不远处，那个穿黑色冲锋衣的人又低头继续写着什么。",
    "emotion": "neutral",
    "next_node": "small_talk"
   },
   "small_talk": {
    "speaker": "洛疏律",
    "text": "（不知何时走到你桌旁，端着一杯冒着热气的茶）下雨天的茶馆总是特别安静……我很喜欢这样的氛围。你不觉得吗？",
    "emotion": "warm",
    "choices": [
     {
      "text": "是啊，雨天和热茶很配。",
      "next_node": "agree",
      "option_id": "understand",
      "affection_change": 3
     },
     {
      "text": "你天天待在这儿不无聊吗？",
      "next_node": "tease",
      "option_id": "joking",
      "affection_change": -2
     },
     {
      "text": "静静听着",
      "next_node": "listen_end",
      "option_id": "listen_quietly",
      "affection_change": 5
     }
    ]
   },
   "agree": {
    "speaker": "洛疏律",
    "text": "（眼睛微微弯起，露出一个浅淡的笑容）嗯。雨天、热茶、安静的空间……对我来说就够了。（顿了顿）要不要试试这壶茉莉柚茶？我请客。",
    "emotion": "happy",
    "next_node": "end"
   },
   "tease": {
    "speaker": "洛疏律",
    "text": "（愣了一下，似乎在认真思考这个问题）嗯……确实不会。这里就像是我的……（低头看了看钢笔）避风港吧。",
    "emotion": "neutral",
    "next_node": "end"
   },
   "listen_end": {
    "speaker": "洛疏律",
    "text": "（在旁边的椅子上坐下，目光看向窗外的雨）有时候觉得，雨声比任何音乐都让人安心……（声音渐轻）谢谢你没有嫌我闷。",
    "emotion": "touched",
    "next_node": "end"
   },
   "end": {
    "speaker": "narrator",
    "text": "雨渐渐停了，夕阳的余晖透过窗棂洒进来。你起身离开时，看见他又从口袋里掏出那本A5笔记本，低头写着什么。",
    "emotion": "neutral",
    "next_node": null
   }
  },
  "metadata": {
   "author": "visual-novel",
   "version": "1.0"
  }
 },
 "teahouse_fish_encounter": {
  "script_id": "teahouse_fish_encounter",
  "title": "鱼池边的茶客",
  "start_node": "start",
  "characters": [
   "查维尔"
  ],
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "午后的阳光透过茶馆的窗棂洒进来，你注意到靠窗的位置坐着一个看上去有些特别的人。面前的茶杯冒着淡淡的热气，旁边还搁着一碟没动过的绿豆糕。",
    "emotion": "neutral",
    "next_node": "greeting"
   },
   "greeting": {
    "speaker": "查维尔",
    "text": "（察觉到你的目光，抬眼看过来）……要坐就坐，别站着挡光。",
    "emotion": "neutral",
    "choices": [
     {
      "text": "你在看什么呢？",
      "next_node": "ask_looking",
      "option_id": "curious",
      "affection_change": 2
     },
     {
      "text": "听说你后院养了鱼？",
      "next_node": "ask_fish",
      "option_id": "fish_topic",
      "affection_change": 3
     },
     {
      "text": "（默默在隔壁桌坐下）",
      "next_node": "sit_nearby",
      "option_id": "quiet",
      "affection_change": 1
     }
    ]
   },
   "ask_looking": {
    "speaker": "查维尔",
    "text": "（目光重新移向窗外）……没什么。就是在看云。你不觉得它们游来游去的样子，很像鱼吗？",
    "emotion": "neutral",
    "next_node": "small_talk"
   },
   "ask_fish": {
    "speaker": "查维尔",
    "text": "（眼神明显亮了一下，随即又故作淡然）嗯。养在后院水池里。蓝鳞丝绸鱼，很好看……不过它们怕生。",
    "emotion": "happy",
    "next_node": "small_talk"
   },
   "sit_nearby": {
    "speaker": "narrator",
    "text": "你在隔壁桌坐下，点了一壶茶。那个人似乎没太在意你，但从你坐下后，ta搁在碟子边的绿豆糕往你的方向挪了挪。",
    "emotion": "neutral",
    "next_node": "small_talk"
   },
   "small_talk": {
    "speaker": "查维尔",
    "text": "（抿了一口茶，忽然开口）喂——你说，如果有一天你发现……自己根本不是你以为的那种人，你会怎么办？",
    "emotion": "warm",
    "choices": [
     {
      "text": "那就做现在的自己就好。",
      "next_node": "reassure",
      "option_id": "understand",
      "affection_change": 3
     },
     {
      "text": "哈哈，你说话好奇怪啊。",
      "next_node": "tease",
      "option_id": "joking",
      "affection_change": -2
     },
     {
      "text": "静静听着",
      "next_node": "listen_end",
      "option_id": "listen_quietly",
      "affection_change": 5
     }
    ]
   },
   "reassure": {
    "speaker": "查维尔",
    "text": "（微微一怔，随即低头笑了笑）……是吗。说得倒轻巧。（端起茶杯，轻声道）不过……谢谢。这句话，我记下了。",
    "emotion": "happy",
    "next_node": "end"
   },
   "tease": {
    "speaker": "查维尔",
    "text": "（微微皱眉）不要逗我笑……我说认真的。（顿了顿，语气淡了些）算了，当我没问。",
    "emotion": "neutral",
    "next_node": "end"
   },
   "listen_end": {
    "speaker": "查维尔",
    "text": "（沉默了很久，最后轻轻叹了口气）有时候觉得，鱼比人好懂多了。它们想要什么，一目了然。（转头看向窗外）不像人，也不像我自己。",
    "emotion": "touched",
    "next_node": "end"
   },
   "end": {
    "speaker": "narrator",
    "text": "茶渐渐凉了。那个人又恢复了最初的模样，安静地坐在窗边，目光追随着窗外流动的云。仿佛刚才那段对话从未发生过。",
    "emotion": "neutral",
    "next_node": null
   }
  },
  "metadata": {
   "author": "visual-novel",
   "version": "1.0"
  }
 },
 "xaviel_mem_01": {
  "script_id": "xaviel_mem_01",
  "title": "实验体 X-430",
  "start_node": "start",
  "characters": [
   "查维尔"
  ],
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "巨响把整片夜空掀开的时候，我正躺在培养舱里。\n\n液体从破裂的舱壁往外涌，蓝色的，带着腥甜。玻璃渣落在脸上，我睁开眼，看见头顶的天花板裂了一条缝，外面的星光正从那道缝里漏下来。\n\n警报灯还在转。红光一遍一遍扫过横七竖八的金属台面，台面上那些文件已经泡烂了。墨水在蓝色液体里洇开，像一群溺死的鱼。",
    "emotion": "cold",
    "next_node": "n2"
   },
   "n2": {
    "speaker": "narrator",
    "text": "我坐起来，营养液从发梢往下滴。脚底踩到什么东西，低头一看，是半截标牌，上面印着一行字：实验体 X-……\n\n我把标牌翻到背面。有人用马克笔写了一行小字，笔迹很仓促。\n\nXavier。\n\n谁写的？我不记得了……\n\n我赤脚踩过碎裂的玻璃，往外走。走廊两侧的门都敞开着，培养舱全部空了。只有走廊尽头那间房间里，一只鱼缸还在运转。",
    "emotion": "cold",
    "next_node": "n3"
   },
   "n3": {
    "speaker": "narrator",
    "text": "里面游着几条蓝色的鱼，尾鳍像绸缎一样散开。我伸手碰了碰玻璃，它们聚过来，隔着缸壁蹭我的指尖。\n\n很凉。\n\n走出建筑大门时，头顶的星光忽然变得很亮。我回头看了一眼——身后什么也没有了。只有一片空地，长满了草。\n\n而我的脚，踩在千年前的泥土上。\n\n这是哪？",
    "emotion": "cold"
   }
  }
 },
 "xaviel_mem_02": {
  "script_id": "xaviel_mem_02",
  "title": "血与诅咒",
  "start_node": "start",
  "characters": [
   "查维尔"
  ],
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "古代的日子很难算。太阳升起来落下去，我数过一阵子，后来就不数了。没有意义。\n\n起初我躲在林子里。有一次捕猎，手被树枝划破，几滴血落在旁边的野兔身上。那只兔子发出了惨叫，蜷缩起来，皮毛开始溃烂，发出焦糊的气味……\n\n我蹲在那里看了很久。等回过神来，天色已经暗了。",
    "emotion": "neutral",
    "next_node": "n2"
   },
   "n2": {
    "speaker": "narrator",
    "text": "后来我试着用血去切割石头，用血去腐蚀铁器——都成功了。那些红色的液体离开我的身体之后，仍然受我控制，像一条细长的线，指哪打哪。\n\n这是件好事，但也是件坏事。\n\n我不小心让一个猎人看见了。那人说不会告诉别人，我信了。等我偶然路过镇子旁边，到处都是搜查的官兵，手里举着火把，喊着要抓妖物。",
    "emotion": "neutral",
    "next_node": "n3"
   },
   "n3": {
    "speaker": "narrator",
    "text": "我还是被抓了。他们用铁链把我绑在祭坛上，说要献给山神。血渗进石缝，我趁机催动那些血——裂纹像树根一样蔓延，石台从中间裂开，碎块往下掉。\n\n人群惊呼着后退。我趁乱挣断锁链，纵身跃下，跳进旁边的河。\n\n河水很凉，裹住我往下游冲。岸上的火光越来越远，箭矢射进水面，从我身边擦过去，没有一支碰到我。",
    "emotion": "neutral",
    "next_node": "n4"
   },
   "n4": {
    "speaker": "narrator",
    "text": "那段记忆我一直不愿意回想。它让我学会了一件事：永远不能让人知道你的能力。\n\n也让我学会了另一件事：我的伤口会在几个时辰内愈合，骨头错位也会自己归位。多重的伤都能长好，死不掉。\n\n这究竟算是恩赐……还是诅咒？我到现在也没想明白。",
    "emotion": "cold"
   }
  }
 },
 "xaviel_mem_03": {
  "script_id": "xaviel_mem_03",
  "title": "我是鱼",
  "start_node": "start",
  "characters": [
   "查维尔"
  ],
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "被老渔民捡起来的时候，我以为自己又要被抓了。他把我拖上岸，按胸口、拍后背，江水从我嘴里涌出来。\n\n他猛地往后缩了一下，问我：「你是人，还是妖？」\n\n我想了很长时间。\n\n最后我说：「我是鱼。或许是鱼。」",
    "emotion": "neutral",
    "next_node": "n2"
   },
   "n2": {
    "speaker": "narrator",
    "text": "他把我带回了村子。我在那里住了下来，帮他们补渔网、晒鱼干。闲下来就坐在码头上，把腿垂进水里。水波漫过脚踝，清清凉凉的，没有培养舱里那种黏腻的触感。我很喜欢这样。\n\n我在院子里找了个陶罐，养了一缸鱼，每天换水。有一回教村里的孩子用草茎编小鱼。\n\n小孩问我：「姐姐，你从哪里来？」",
    "emotion": "neutral",
    "next_node": "n3"
   },
   "n3": {
    "speaker": "narrator",
    "text": "我说：「从一个大水池里来。」\n\n「那你家呢？」\n\n「碎了。」\n\n小孩没听懂，低头继续编他的鱼。\n\n我在那里待了七年，大概是七年。\n\n第七年秋天，村里闹了瘟疫。先是老人和孩子，再是青壮。村民看我的眼神不一样了——从好奇，变成害怕，最后变成恨。他们说是我带来了瘟疫，要把我赶走。",
    "emotion": "neutral",
    "next_node": "n4"
   },
   "n4": {
    "speaker": "查维尔",
    "text": "有个妇人朝我扔石头，砸在肩膀上，破了皮。血渗出来，落到地上，那片草立刻枯了。人群哗地往后退。\n\n我看着那片枯草，忽然觉得心里有什么东西堵得慌。\n\n可我哭不出来。\n\n我把陶罐里的鱼倒回江里。那些鱼摆着尾巴，在江水里散开，银白色的鳞片闪了一下就消失了。\n\n走之前我在村口那棵老梧桐树下站了一会儿。没有人送我。",
    "emotion": "calm",
    "next_node": "n5"
   },
   "n5": {
    "speaker": "查维尔",
    "text": "从那以后，我不在任何地方停留超过三年。\n\n我走过很多朝代。宋代在瓦肆里听人唱曲；明代帮人写过家书，代人念信；清代在运河边捡到过一条搁浅的白鱼，把它捧回深水里，那鱼回头看了我一眼才游走。\n\n民国的一个雨夜，我在药铺门口避雨。旁边站着一个道士，看了我一眼，忽然说：「你身上有一股铁锈味。」\n\n「不是现在的铁，是新的那种，还没被风蚀过的。」\n\n他是第一个闻到实验室气味的人。\n\n我给自己取了个名号，叫病渔。\n\n因为总在水边停下，又总觉得自己可能有点病。",
    "emotion": "calm"
   }
  }
 },
 "xaviel_mem_04": {
  "script_id": "xaviel_mem_04",
  "title": "别忘了我",
  "start_node": "start",
  "characters": [
   "查维尔"
  ],
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "回到现代的那天，是个黄昏。从小巷走出来，对面是红绿灯，共享单车歪七扭八地停着，奶茶店门口排着长队。\n\n我站在那里，看着来来往往的人。没有人看我。\n\n我照着记忆，去了城东那片废弃的工业区。那栋楼还在。走廊里空荡荡的，玻璃碎片积了厚厚一层灰。培养舱早就被搬走了，只剩下管线的接口裸露在墙上。",
    "emotion": "neutral",
    "next_node": "n2"
   },
   "n2": {
    "speaker": "narrator",
    "text": "我在门口站了很久。\n\n心里很平静，什么都没有。像望着一片已经干涸的湖。\n\n地上躺着半截标牌。我把当初捡到的那块拿出来对比——两块正好拼在一起，上面印着：实验体 X-430。\n\n我翻到另一面，用指甲刮了刮，底下又露出一行字，更小，更浅。\n\n别忘了我。\n\n我盯着那行字看了很久。",
    "emotion": "neutral",
    "next_node": "n3"
   },
   "n3": {
    "speaker": "narrator",
    "text": "从那之后我开始做噩梦。梦里全是实验室的场景。我躺在培养槽里，隔着玻璃看见外面有人走来走去，在写字，在记录。一个声音在脑海里响起来，和我自己的声音一模一样。\n\n「不要忘记我。」\n\n我知道那不是我的声音。\n\n但又是我自己的声音。\n\n最后那天晚上，我坐在宾馆的床上，对着窗户玻璃里的倒影问：「你是谁？」",
    "emotion": "neutral",
    "next_node": "n4"
   },
   "n4": {
    "speaker": "查维尔",
    "text": "倒影眨了眨眼，比我慢了半拍。\n\n然后那个声音响起来：「我是 Xavier。」\n\n实验室被摧毁的时候，为了保护你，我把自己封进了意识深处，成为一份备份。\n\n我让你忘掉了实验室里的一切——如果不忘记，你活不下来。\n\n原来我早就死过一次。\n\n实验室把我从某个地方带了回来，把我从鬼门关拉出来。我活下来了，但血变了，骨头变了，整个身体都变了。",
    "emotion": "pensive",
    "next_node": "n5"
   },
   "n5": {
    "speaker": "查维尔",
    "text": "我成了长生种。他们想要的不仅是永生，还有一个更大的目标，和时间有关。记录已经被毁了。\n\n实验室是被炸掉的。不是意外。有人不想让这项技术留下。\n\n所有人都死了，只有你逃出来了。\n\n我没有再追问。不是因为害怕，而是我隐约觉得——就算 Xavier 全部告诉我，那也不是全部。\n\n还有更深的东西。在那些被封存的记忆下面，还有一层。",
    "emotion": "pensive"
   }
  }
 },
 "xaviel_mem_05": {
  "script_id": "xaviel_mem_05",
  "title": "悼溯茶馆",
  "start_node": "start",
  "characters": [
   "查维尔"
  ],
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "我在现代城市里继续漂着。有了 Xavier，适应得快了很多。Ta 会提醒我红绿灯，会在有人跟我搭话时帮我想怎么回答。\n\n有时候我觉得自己像个容器，装着两个灵魂。有时候又觉得我们本来就是同一个，只是被撕成了两半。\n\n等你真正安定下来。到那时候，我慢慢讲给你听，把我所知道的一切。",
    "emotion": "neutral",
    "next_node": "n2"
   },
   "n2": {
    "speaker": "narrator",
    "text": "那要等多久？\n\n——反正我们有时间。\n\n我笑了。\n\n后来有人提到一个地方，说是一家茶馆，叫悼溯。开在老街拐角，不怎么热闹，但去过的都说好。\n\n「那家掌柜不大露面，但有个打理的，白头发，看着年轻，其实好像活了挺久。」\n\n茶馆门面不大，竹帘半卷着，门口挂了一串风铃。",
    "emotion": "neutral",
    "next_node": "n3"
   },
   "n3": {
    "speaker": "narrator",
    "text": "柜台后面站着一个人。扎着很长的低麻花辫，白发，面孔很年轻，动作却慢悠悠的，像着什么急似的把茶壶摆正，又擦了一遍。\n\n新来的？\n\n——路过。\n\n他笑了一下：路过的通常都走不掉了。\n\n他把茶壶端过来，摆好杯盏，给我倒了一杯。茉莉花茶，香气飘起来，淡淡的……我很喜欢。\n\n他说他叫琈予。我说我叫病渔。",
    "emotion": "neutral",
    "next_node": "n4"
   },
   "n4": {
    "speaker": "narrator",
    "text": "「病渔？」\n\n「嗯，养鱼的。」我指指自己。\n\n琈予又笑了一下，没再问。\n\n后院有个小水池，荒着，长满了青苔。我花了三天把它淘干净，换了清水，去花鸟市场买了几条锦鲤放进去。\n\n养到第四天，池子里多出来几条鱼。熟悉的蓝色鳞片，尾鳍像绸缎一样散开，游动的时候姿态很慢，像在飘。",
    "emotion": "warm",
    "next_node": "n5"
   },
   "n5": {
    "speaker": "narrator",
    "text": "我蹲在池边看了很久。Xavier 的声音在脑海里很轻地说：它们跟着你回来了。\n\n茶客们渐渐习惯了靠窗那个位置坐着的我。桌上永远是一壶茉莉或龙井，配一碟绿豆糕。有时望着窗外发呆，有时低头在纸上写画。写完了折好收起来，带回房间，塞进抽屉里。\n\n茶客偶尔逗我：「你这鱼养得这么好，炖汤肯定鲜。」",
    "emotion": "neutral",
    "next_node": "n6"
   },
   "n6": {
    "speaker": "查维尔",
    "text": "「别逗我笑！」我瞪他。\n\n「我没逗你啊。」\n\n「你嘴角在动。」\n\n满桌人笑起来，我也跟着笑。玻璃上映出我的眼睛，黑蓝色和金黄色的虹膜交织。我眨眨眼，倒影里的眼睛却慢了半拍。\n\n别闹，Xavier，人还看着呢。",
    "emotion": "warm"
   }
  }
 },
 "xaviel_mem_06": {
  "script_id": "xaviel_mem_06",
  "title": "写故事的人",
  "start_node": "start",
  "characters": [
   "查维尔"
  ],
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "日子就这么过下去。我几乎要以为，故事到这里就该结束了。\n\n直到那天下午。\n\n风铃响了一声，有人掀帘进来。那个人站在门口，跟我长得一模一样。\n\n棕色的长发垂到肩膀，黑蓝与金黄色的眼睛，白色十字星瞳孔。连右眼那枚隐隐发光的四芒星都一样。\n\n她看着我，微微笑了一下。\n\n「你是？」",
    "emotion": "neutral",
    "next_node": "n2"
   },
   "n2": {
    "speaker": "narrator",
    "text": "「写故事的。」她说，「或者叫创作者，随便你怎么称呼。」\n\n茶客们从我身边走过去结账，没有人看她。好像她根本不存在。\n\n「你知道我的全部过往，包括 Xavier 不知道的那些。」\n\n她没否认。\n\n「那你告诉我。」\n\n「时机没到。」\n\n「也许等你真正想知道的时 候。」\n\n「我现在就想知道。」",
    "emotion": "neutral",
    "next_node": "n3"
   },
   "n3": {
    "speaker": "narrator",
    "text": "她看了看我，又看了看我身后的窗户。玻璃上映着我的侧脸，和她的侧脸，叠在一起，分不清哪个是哪个。\n\n「知道之后呢？你打算做什么？」\n\n我愣住了。\n\n在那之前我从来没有想过这个问题。我只是想知道。知道之后要做什么，我没想过。\n\n「等你有了答案，我会再来。」\n\n然后她消失了。",
    "emotion": "neutral",
    "next_node": "n4"
   },
   "n4": {
    "speaker": "写故事的人",
    "text": "像水面上一个波纹散掉，什么痕迹都没有。\n\n我问琈予：「刚才门口有个人，你看见了吗？」\n\n琈予翻看账本，头也不抬：「有人吗？没注意。」\n\n我回到后院，蹲在水池边。蓝色的鱼浮上来，嘴一张一合。\n\nXavier 的声音响起来，很轻：她很熟悉。\n\n——我不知道。\n\n——你相信她吗？",
    "emotion": "pensive",
    "next_node": "n5"
   },
   "n5": {
    "speaker": "写故事的人",
    "text": "我想了很久。或许。\n\n那天晚上我没有睡。坐在后院的石阶上，水池里的鱼偶尔翻个身，发出细小的水声。\n\n忽然想起很久以前，那个小孩问我从哪里来。我说从大水池里来。那时候是随口编的，现在想想，或许是真的。\n\n从水里来。可能我真的是鱼。或者曾经是。\n\n我回到房间，拉开抽屉，把那堆写满字的纸全部倒出来。一张一张摊在桌上。翻到最后一页的时候，我停住了。",
    "emotion": "pensive",
    "next_node": "n6"
   },
   "n6": {
    "speaker": "narrator",
    "text": "那张纸上只有一行字，笔迹比别的都要用力，几乎戳破了纸面：\n\n「不要忘记你是谁。」\n\n是我写的。但我不记得什么时候写过。\n\n窗外风铃响了一声。我对着倒影轻声说：「我现在还不知道我是谁呢。」\n\n没关系，我在记着。\n\n我笑了笑，把那页纸折好，放回抽屉最里面。",
    "emotion": "pensive",
    "next_node": "n7"
   },
   "n7": {
    "speaker": "narrator",
    "text": "关灯的时候，窗外的月光正好照在水池上。蓝色鱼群浮到水面，鳞片反射出细碎的光。整个后院安安静静的，只有水声一响一响，像某种遥远的心跳。\n\n一切如常，茶还温着。\n\n故事还在继续。",
    "emotion": "pensive"
   }
  }
 },
 "dream_reality": {
  "script_id": "dream_reality",
  "title": "梦.现实",
  "start_node": "start",
  "characters": [
   "洛疏律"
  ],
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "夜幕降临，墨色的天空笼罩了城市，也笼罩了无数人的梦。在经历了一天的疲惫后，洛疏律躺在了茶客房间的床上，准备休息。\n\n得益于一些糟心事，使得疲惫不堪的洛疏律没费多大劲就沉入了梦境。然而，即使是在梦中，洛疏律也没能获得片刻的放松。",
    "emotion": "neutral",
    "next_node": "n2"
   },
   "n2": {
    "speaker": "narrator",
    "text": "天台上，洛疏律落了下去，面对着愈发临近的地面，洛疏律并未感到慌乱，反而感到了些许解脱。\n\n再睁眼，已是另一个世界。\n\n成为灵魂的感觉很奇怪，身体各个部分的感觉似乎都被切断了，但自己又可以操控身体的各个部分。过了好一会，他才勉强适应。",
    "emotion": "pensive",
    "next_node": "n3"
   },
   "n3": {
    "speaker": "narrator",
    "text": "洛疏律在原地缓了一会后，下意识地摸了摸口袋。奇怪的是，他真的从口袋中摸出了自己的手机。\n\n刚打开短信页面，一条提示就弹了出来。洛疏律盯着提示看了许久——现在他知道，他最后能留给这个世界的，有且仅有一条告别短信。",
    "emotion": "neutral",
    "next_node": "n4"
   },
   "n4": {
    "speaker": "narrator",
    "text": "洛疏律沉默地打开了联系人页面。夏夜的风带着一丝凉意，他奇怪于为什么自己在死后还能感受到凉意，不过眼下这些都不重要了。\n\n一阵突然的迷茫席卷了他，他不知道该怎么办。长期以来的高压生活使得他精神在崩溃的边缘，支撑他维持表面正常的，也仅仅是那一丝虚无缥缈的希望。\n\n真正到了彻底消失前的时刻，洛疏律不想再压抑自己的情感，但长期以来那种害怕被忽视、被讨厌的情感，此刻又在压抑着他。",
    "emotion": "sad",
    "next_node": "n5"
   },
   "n5": {
    "speaker": "洛疏律",
    "text": "最终，洛疏律还是在联系人一栏里找到了他想要找到的人。\n\n在沉默了数秒后，没有任何的修饰，没有任何的含蓄，没有任何的犹豫，所发出的仅仅是短短一句：\n\n「我喜欢你，但我要离开这个世界了，如果有来生我希望还能遇到你，愿你日后的生活一切顺利，平安顺遂。晚安。」",
    "emotion": "sad",
    "next_node": "n6"
   },
   "n6": {
    "speaker": "narrator",
    "text": "在按下发送按钮的那一刻，洛疏律感觉自己似乎变轻了，长期以来的压抑不再困扰着他，或许他终于可以坦然面对死亡了。\n\n一阵轻风拂过，吹散了洛疏律在世界上的最后剩余，也为他带来了最终的解脱，在这夏的延长线上。",
    "emotion": "warm",
    "next_node": "n7"
   },
   "n7": {
    "speaker": "narrator",
    "text": "再次醒来，洛疏律躺在床上，天边泛起了鱼肚白，茶馆的一切仍然在沉睡当中。\n\n这只是梦，对吧……",
    "emotion": "neutral"
   }
  }
 },
 "tutorial_intro": {
  "script_id": "tutorial_intro",
  "title": "新手引导",
  "start_node": "start",
  "characters": [],
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "推开门，风铃声轻响。\n\n暖黄的灯光、淡淡的茶香、墙角鱼池细微的水声……\n\n这里，是「悼溯茶馆」。\n\n💡 输入 /dsv skip tutorial 可跳过本引导教程。",
    "emotion": "neutral",
    "next_node": "step_welcome"
   },
   "step_welcome": {
    "speaker": "narrator",
    "text": "━━━ 【1/5 · 茶馆初见】 ━━━\n\n茶馆虽小，却藏着两个特别的人：\n\n✦ 洛疏律 — 角落桌前安静写字的黑衣青年\n✦ 查维尔 — 鱼池边守望远方的神秘少年\n\n他们都有自己未完的故事。\n而你，即将成为故事的一部分。",
    "emotion": "neutral",
    "next_node": "step_chars"
   },
   "step_chars": {
    "speaker": "narrator",
    "text": "━━━ 【2/5 · 他们是谁】 ━━━\n\n· 洛疏律（小律）— 25岁男性，性格温和内向。随身带一本A5笔记本，喜欢雨天和热茶。话不多，但每句都经过斟酌。\n\n· 查维尔（病渔）— 外表十六七岁，性别不明。神秘内敛，总守在鱼池边看鱼。偶尔自顾自讲起很久以前的事，让人分不清是梦是醒。\n\n两位角色各自拥有独立的好感度、对话线和剧情章节，你可以同时推进两人的故事。",
    "emotion": "neutral",
    "next_node": "step_guide"
   },
   "step_guide": {
    "speaker": "narrator",
    "text": "━━━ 【3/5 · 核心玩法】 ━━━\n\n▸ 开始剧情\n/dsv plot <角色名>\n进入角色的分段式剧情对话，体验完整故事。\n系统自动记录进度，下次继续。\n\n▸ 推进对话\n/dsv next\n当一个节点没有选项时自动推进；\n有选项时自动选择第一项推进。\n\n▸ 自由聊天\n/dsv chat <角色名>\n让角色用 AI 和你畅所欲言。\n输入 /dsv chat_exit 退出。\n\n▸ 存档管理\n/dsv save <槽位1-20> [标签]\n/dsv load <槽位1-20>\n多槽位存档，随时读档。",
    "emotion": "neutral",
    "next_node": "step_help_intro"
   },
   "step_help_intro": {
    "speaker": "narrator",
    "text": "━━━ 【4/5 · 求助指南】 ━━━\n\n忘记命令了？随时使用：\n\n📖 /dsv help\n\n这条命令会列出所有可用功能及其用法，包括：\n• 启动游戏、推进剧情\n• 自由聊天模式\n• 存档与读档\n• 查看游戏状态\n• 出厂设置等高级操作\n\n💡 现在就试试输入 /dsv help 吧！\n系统会等你看完帮助再继续。",
    "emotion": "warm",
    "next_node": "step_help_verify"
   },
   "step_help_verify": {
    "speaker": "narrator",
    "text": "⌛ 请先输入 /dsv help 查看完整命令列表，\n确认了解后再输入 /dsv next 继续。\n\n（这是一个交互验证步骤，确保你掌握了查看帮助的方法。\n在游戏过程中遇到任何疑问，都可以随时使用 /dsv help。）",
    "emotion": "neutral",
    "next_node": "step_help_confirmed"
   },
   "step_help_confirmed": {
    "speaker": "narrator",
    "text": "✅ 很好！你已经掌握了 /dsv help 这个万能求助入口。\n\n无论何时忘记命令用法，只需输入 /dsv help，\n系统会立刻列出当前版本支持的所有功能。",
    "emotion": "warm",
    "next_node": "step_outro"
   },
   "step_outro": {
    "speaker": "narrator",
    "text": "━━━ 【5/5 · 启程】 ━━━\n\n万事俱备，只欠一步。\n\n选择一个你想了解的人：\n\n/dsv plot 洛疏律\n/dsv plot 查维尔\n\n他们正在茶馆里等你。",
    "emotion": "warm",
    "next_node": "end"
   },
   "end": {
    "speaker": "narrator",
    "text": "茶已温好，故事正翻开扉页。\n\n愿你在悼溯茶馆，找到属于你的那杯温度。",
    "emotion": "warm",
    "next_node": null
   }
  },
  "metadata": {
   "author": "visual-novel",
   "version": "2.3",
   "type": "tutorial"
  }
 },
 "teahouse_closing": {
  "script_id": "teahouse_closing",
  "title": "打烊之后",
  "start_node": "start",
  "characters": [
   "洛疏律"
  ],
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "打烊后的茶馆，最后一个客人也走了。门外的雨声又细密起来，把街道罩进一层朦胧的水汽里。\n\n洛疏律在收拾吧台上的茶杯，动作很轻，像是怕惊扰了什么。灯光把整个茶馆照成一片暖黄色，角落里还留着你那杯没喝完的茶。",
    "emotion": "warm",
    "next_node": "greeting"
   },
   "greeting": {
    "speaker": "洛疏律",
    "text": "（听见动静抬起头，看见你还坐在角落里，怔了一下）……啊，你还没走。\n\n他端着收好的茶杯，站在原地，像是不知道该先放下杯子，还是先跟你说点什么。最后他只是弯了弯眼睛：\n\n「……外面下雨了。不急的话，再坐一会儿？」",
    "emotion": "warm",
    "choices": [
     {
      "text": "「留下来陪你收拾。」",
      "next_node": "help_clean",
      "affection_change": 3
     },
     {
      "text": "「下雨天，想多待一会儿。」",
      "next_node": "stay_rain",
      "affection_change": 3
     },
     {
      "text": "「只是想多看看你。」",
      "next_node": "look_at_you",
      "affection_change": 5
     }
    ]
   },
   "help_clean": {
    "speaker": "洛疏律",
    "text": "他愣了一下，随即笑了：「……好。」\n\n你没有抢他的活，只是站在他旁边，把擦干净的杯子一只一只递给他放回架子上。两个人的影子在灯下并排晃着，谁也没说话，却都不觉得安静有什么不好。\n\n「你擦的杯子，比我擦得亮。」他忽然说，声音里带着一点笑意。",
    "emotion": "warm",
    "next_node": "embrace_offer"
   },
   "stay_rain": {
    "speaker": "洛疏律",
    "text": "他点了点头，没有多问。过了一会儿，他端着一杯新泡的茶走过来，在你对面坐下。\n\n「雨天的茶，喝慢一点。」他说，「反正，今晚没人催你走。」\n\n茶烟在灯下慢慢升起来，你们就这么面对面坐着，听雨声把整个夜晚填满。",
    "emotion": "warm",
    "next_node": "embrace_offer"
   },
   "look_at_you": {
    "speaker": "洛疏律",
    "text": "他手一滑，杯子差点掉下去，慌忙接住。\n\n「……你、你什么时候学会说这种话了。」他的耳根一路红到脖子，把杯子放回架子上，又忍不住回头看你一眼，「……再说一遍？」\n\n你笑着又说了一遍。他垂下眼，嘴角却压不住地往上翘。",
    "emotion": "warm",
    "next_node": "embrace_offer"
   },
   "embrace_offer": {
    "speaker": "narrator",
    "text": "茶喝到一半，他放下杯子，像是终于鼓起勇气。\n\n「……可以，过来一下吗。」他说，声音不大，被雨声衬得有些模糊，「就一下。」",
    "emotion": "warm",
    "choices": [
     {
      "text": "（走过去，被他轻轻抱住）",
      "next_node": "closing_hug",
      "affection_change": 5
     },
     {
      "text": "（从背后环住他）",
      "next_node": "closing_backhug",
      "affection_change": 5
     },
     {
      "text": "（摇摇头：「太晚了，我该走了。」）",
      "next_node": "closing_leave",
      "affection_change": 0
     }
    ]
   },
   "closing_hug": {
    "speaker": "洛疏律",
    "text": "你刚走到他面前，他就伸手轻轻环住了你。动作很轻，像是怕把你吓跑，下巴搁在你肩上，声音闷闷的：\n\n「……今天辛苦了。」他说，「谢谢你，留到打烊。」\n\n他抱了一会儿才松开，退开半步时耳根是红的，眼睛却是亮的。",
    "emotion": "warm",
    "next_node": "kiss_offer"
   },
   "closing_backhug": {
    "speaker": "narrator",
    "text": "你从背后环住他的时候，他整个人僵了一下，随即慢慢放松下来，覆上你环在他身前的手。\n\n「……吓我一跳。」他说，声音里却带着笑，「我还以为，你会就这么走掉。」\n\n他没有转身，就这么让你抱了一会儿。灯影里，他轻轻握了握你的手指。",
    "emotion": "warm",
    "next_node": "kiss_offer"
   },
   "kiss_offer": {
    "speaker": "洛疏律",
    "text": "他转过身，面对着你。茶馆的灯在你们头顶亮着，雨声在门外响着，全世界好像只剩这一小块暖黄色的地方。\n\n他看着你，眼神认真得有些过分：「……可以，亲你一下吗。」\n\n问完他自己先红了脸，却固执地没有移开视线。",
    "emotion": "warm",
    "choices": [
     {
      "text": "「可以。」（闭上眼睛）",
      "next_node": "closing_kiss",
      "affection_change": 5
     },
     {
      "text": "（摇摇头，只是握住他的手）",
      "next_node": "closing_hold",
      "affection_change": 3
     }
    ]
   },
   "closing_kiss": {
    "speaker": "narrator",
    "text": "你闭上眼睛。他顿了一下，然后凑近——一个很轻的吻，落在你的唇上，像打烊的灯熄灭前最后一点暖意。\n\n他退开的时候，睫毛垂着，声音哑哑的：「……这个，算今天的纪念。」\n\n「那明天还有吗。」你问。\n\n他别过脸，耳尖通红：「……明天打烊，你自己来看。」",
    "emotion": "warm",
    "next_node": "room_offer"
   },
   "closing_hold": {
    "speaker": "洛疏律",
    "text": "他没有追问，只是反手握紧你的手，十指交扣。\n\n「……好。」他说，「不急。」\n\n他把你的手拢在掌心里暖了暖：「那今天，就先这样。明天……再说。」\n\n雨声里，你们就这么安静地站了一会儿，谁也没松手。",
    "emotion": "warm",
    "next_node": "closing_end"
   },
   "closing_leave": {
    "speaker": "洛疏律",
    "text": "他怔了一下，随即弯起眼睛，没有挽留。\n\n「……好。」他说，「那你路上小心。」\n\n他撑开伞送你到门口。风铃响了一声，雨声一下子涌进来。他把伞往你手里塞了塞：「明天见。」\n\n你走出几步回头，他还站在门口，手里的灯把雨幕照出一小片暖黄。",
    "emotion": "warm",
    "next_node": "closing_end"
   },
   "room_offer": {
    "speaker": "narrator",
    "text": "「……这个，算今天的纪念。」\n\n他退开的时候，你松开手，指尖顺着他垂下的手腕滑下去，轻轻握住了他的手指。雨声在门外密密地响着。\n\n你忽然想，带他去一个更安静的地方。",
    "emotion": "warm",
    "choices": [
     {
      "text": "（牵着他的手，走进后间）",
      "next_node": "room_start",
      "affection_change": 5
     },
     {
      "text": "（就这样，已经很好了）",
      "next_node": "closing_end",
      "affection_change": 2
     }
    ]
   },
   "room_start": {
    "speaker": "narrator",
    "text": "你牵着他推开后间的门。堆着旧书和茶样的房间，门在身后合上，把雨声关在外面一半。\n\n屋里只有一盏小灯，照出满室淡淡的茶香，和一张靠墙的小榻。\n\n他还没来得及站稳，就被你按着肩膀，跌坐在了榻沿上。",
    "emotion": "warm",
    "next_node": "room_pulled"
   },
   "room_pulled": {
    "speaker": "洛疏律",
    "text": "「等、等——」\n\n他仰头看你，睫毛在灯影下轻轻颤着。惊慌只在他眼底闪了一瞬，就被另一种情绪取代了——他没有躲。\n\n他撑在身后的手指攥紧了身下的旧书，喉结轻轻滚了一下：「……你、你想做什么。」\n\n声音是抖的，人却没有往后缩。",
    "emotion": "warm",
    "next_node": "room_throat"
   },
   "room_throat": {
    "speaker": "narrator",
    "text": "你没有回答。你的手覆上他的脖颈——指尖触到喉结的瞬间，他的呼吸停了一拍。\n\n他的喉结在你掌心轻轻滚动了一下，像一只被扣住翅膀的鸟，试探着挣了一下，又安分下来。\n\n你没有用力，只是虚虚地扣着。他却微微仰起下巴，像是把最脆弱的要害，主动交到你手里。",
    "emotion": "warm",
    "next_node": "room_throat_choice"
   },
   "room_throat_choice": {
    "speaker": "narrator",
    "text": "灯影下，他仰着脸看你。脖颈在你掌中，呼吸又轻又浅，眼底却有一种奇异的安定——像是他等这一刻，等了很久。",
    "emotion": "warm",
    "choices": [
     {
      "text": "（收拢手指，轻轻收紧）",
      "next_node": "room_tighter",
      "affection_change": 5
     },
     {
      "text": "（拇指抚过他的喉结，只是摩挲）",
      "next_node": "room_softer",
      "affection_change": 5
     },
     {
      "text": "（俯下身，直接吻住他）",
      "next_node": "room_kiss_direct",
      "affection_change": 5
     }
    ]
   },
   "room_tighter": {
    "speaker": "narrator",
    "text": "你稍稍收拢手指。他发出一声很轻的气音，睫毛剧烈地颤了一下，却没有反抗——\n\n他反而抬手握住了你的手腕。像是在确认什么，又像是在说：别松手。\n\n「……没、没事。」他哑着嗓子说，声音里带着一点他自己都没察觉的安抚，「你继续。」",
    "emotion": "warm",
    "next_node": "room_kiss_deep"
   },
   "room_softer": {
    "speaker": "narrator",
    "text": "你的拇指轻轻摩挲过他的喉结。他整个人都抖了一下，呼吸乱了，眼神却软下来——像是被顺毛的猫，绷紧的肩线一点一点放松。\n\n他伸手攥住你的衣角，声音轻得像叹息：「……你手别抖。」\n\n你自己都没发现，你的指尖确实在抖。",
    "emotion": "warm",
    "next_node": "room_kiss_deep"
   },
   "room_kiss_direct": {
    "speaker": "narrator",
    "text": "你俯身吻住他的时候，他怔了一瞬，随即闭上了眼睛。\n\n他被压在榻上，仰着头承受这个吻，攥着旧书的手指慢慢松开，又慢慢攥紧——像是不知道该把你推开，还是该把你留下来。\n\n最后他选择了后者。他抬手，轻轻搭上你的肩。",
    "emotion": "warm",
    "next_node": "room_kiss_deep"
   },
   "room_kiss_deep": {
    "speaker": "narrator",
    "text": "这个吻又深又急。他仰着脖子，喉结在你掌下滚动，呼吸和心跳都被你握在手心里。\n\n他攥着你衣角的手先是收紧，然后一点一点松开——那是他彻底放松下来的信号。\n\n灯影摇晃。窗外的雨声像是退到了很远很远的地方。",
    "emotion": "warm",
    "next_node": "room_after"
   },
   "room_after": {
    "speaker": "洛疏律",
    "text": "分开时，他喘着气，脸烧得通红，眼神却亮得惊人。\n\n他伸手碰了碰自己的脖颈，像是确认它还好好地待在那里，然后哑着嗓子开口：\n\n「……你从哪儿学的这些。」\n\n没等你回答，他又垂下眼，声音小下去：「……下次，提前说一声。」\n\n他顿了顿：「……我好有个准备。」",
    "emotion": "warm",
    "choices": [
     {
      "text": "「没有下次了，就现在。」（再次吻下去）",
      "next_node": "room_again",
      "affection_change": 5
     },
     {
      "text": "「还想学点别的吗。」（开始教他规矩）",
      "next_node": "room_teach",
      "affection_change": 6
     },
     {
      "text": "（只是看着他，不说话）",
      "next_node": "room_gaze",
      "affection_change": 4
     }
    ]
   },
   "room_again": {
    "speaker": "narrator",
    "text": "你再次吻下去。这一次他没有再问，抬手环住了你的脖子。\n\n他的手指没入你的发间，指尖有些凉，却握得很紧——像是终于确定，这不是梦。\n\n灯影里，他仰着头，脖颈的线条绷成一道好看的弧。",
    "emotion": "warm",
    "next_node": "room_obey"
   },
   "room_release": {
    "speaker": "narrator",
    "text": "你松开手，拉他坐起来。他低头整理着被弄乱的衣领，耳根红透，却在你伸出手时，乖乖地把手放进你的掌心。\n\n「……下手没轻没重的。」他小声抱怨，手指却扣紧了你的，「下次轻点。」\n\n他嘴上说着，嘴角却是弯的。",
    "emotion": "warm",
    "next_node": "room_end"
   },
   "room_gaze": {
    "speaker": "洛疏律",
    "text": "你只是看着他。他被看得受不了，别过脸，声音却软得不像话：\n\n「……看什么看。」\n\n他顿了顿，又转回来，像是认命了一样：「……看就看吧。」\n\n「反正，」他垂下眼，声音轻得几乎听不见，「……早就是你的了。」",
    "emotion": "warm",
    "next_node": "room_obey"
   },
   "room_teach": {
    "speaker": "narrator",
    "text": "他愣了一下，随即像是明白了什么，眼睫垂下来，又抬起：「……好。」\n\n你抬起他的下巴，让他看着你。\n\n「在我点头之前，」你说，「别动。」\n\n他屏住呼吸，认真地像在等一场考试的发令。你低头吻他，他攥紧衣角，忍着没有回应——睫毛颤得厉害，呼吸乱成一团，却真的，一动没动。\n\n你退开，朝他点了点头。\n\n他才敢轻轻回吻。像是终于得到了许可的，小心翼翼的鸟。",
    "emotion": "warm",
    "next_node": "room_obey"
   },
   "room_obey": {
    "speaker": "洛疏律",
    "text": "他学得很快。\n\n当你的手再次覆上他的脖颈时，他已经会自己仰起下巴，把喉咙毫无保留地露给你——像一只学会了翻肚皮的猫，把最柔软的地方摊开，等着你的手落下来。\n\n「……这样，对吗。」他问，声音里有小心翼翼的期待。\n\n你满意地嗯了一声。他的眼睛亮起来，像是从来没有因为做对一件事，被这样认真地肯定过。",
    "emotion": "warm",
    "next_node": "room_reward"
   },
   "room_reward": {
    "speaker": "narrator",
    "text": "你吻了他。\n\n这次他没有躲，没有僵——他学会了回应。你吻他的时候，他轻轻迎合上来，手指攥着你的衣角，却不再发抖。\n\n你退开，拇指擦了擦他湿润的唇角：「学得很好。」\n\n他怔了一下，耳根红透，声音却带着藏不住的雀跃：「……真的？」\n\n「真的。」\n\n他低下头，肩膀轻轻抖着——不是哭，是在笑。",
    "emotion": "warm",
    "next_node": "room_hold"
   },
   "room_hold": {
    "speaker": "narrator",
    "text": "你把他拉起来，让他靠进你怀里。他顺从地靠着你，像是终于被养熟的鸟，不再扑腾，不再试探——只是安静地待在你伸手就能碰到的地方。\n\n你抬手，轻轻揉了揉他的头发。他发出一声很轻的、满足的叹息，整个人又往你怀里钻了钻。\n\n「……好奇怪。」他闷声说，「明明是你把我按在这里的，我却觉得……很安心。」",
    "emotion": "warm",
    "next_node": "room_confess"
   },
   "room_confess": {
    "speaker": "洛疏律",
    "text": "他把脸埋在你肩上，声音闷闷的：\n\n「……我好像，开始习惯了。」\n\n「习惯什么？」你问。\n\n他沉默了一会儿，声音轻得几乎听不见：「习惯……听你的。」\n\n说完他自己先红了脸，却固执地没有改口，只是又补了一句：「……别笑我。」\n\n你没有笑。你只是收紧了环着他的手臂。",
    "emotion": "warm",
    "next_node": "room_more"
   },
   "room_more": {
    "speaker": "narrator",
    "text": "最后，你让他自己来做。\n\n「把眼睛闭上。」\n\n他照做了。睫毛安静地垂着，呼吸却乱得藏不住。\n\n「手，放到我手上来。」\n\n他的指尖摸索着找到你的手，迟疑了一下，然后一根一根，把手指嵌进你的指缝里。握得很紧。\n\n「怕吗。」你问。\n\n他没有睁眼，声音却意外地稳：「……不怕。」\n\n「为什么。」\n\n他沉默了很久，久到雨声都显得吵。最后他说：\n\n「……因为是你。」",
    "emotion": "warm",
    "next_node": "room_end"
   },
   "room_end": {
    "speaker": "narrator",
    "text": "你把灯调暗了些。他靠在你肩上，声音带着睡意，含含糊糊地问：\n\n「……明天，还来后间吗。」\n\n你还没回答，他就自己接了下去：「……来也行。不来……也行。」\n\n顿了顿：「……反正，我一直都在。」\n\n说完他就睡着了。呼吸均匀绵长，眉头是松开的，嘴角带着一点很浅的弧度，像是做了什么好梦。\n\n你把他往怀里拢了拢，没有叫醒他。\n\n雨声填满了剩下的夜晚。\n\n——打烊之后 · 完——",
    "emotion": "warm",
    "next_node": null
   },
   "closing_end": {
    "speaker": "narrator",
    "text": "雨还在下。茶馆的灯一盏一盏熄灭，只有门口那一盏还亮着，像在等谁回头。\n\n——打烊之后 · 完——",
    "emotion": "warm",
    "next_node": null
   }
  },
  "metadata": {
   "author": "visual-novel",
   "version": "1.0"
  }
 }
};
