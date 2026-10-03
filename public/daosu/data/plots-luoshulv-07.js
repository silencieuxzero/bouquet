/* 悼溯茶馆 · 洛疏律 第 7 章《雨停之后》
   由 data/plots-luoshulv.js 拆分而来（2026-08-03）
   加载顺序：characters → plots-*（各章）→ events → meta */
window.DAOSU_DATA = window.DAOSU_DATA || {};
window.DAOSU_DATA.plots = Object.assign(window.DAOSU_DATA.plots || {}, {
 
 "luoshulv_07": {
  "script_id": "luoshulv_07",
  "character_name": "洛疏律",
  "title": "雨停之后",
  "min_affection": 75,
  "start_node": "start",
  "nodes": {
   "start": {
    "speaker": "narrator",
    "text": "雨停之后的黄昏，你收到一张纸条。\n\n笔迹工整，是那个人的字。只有一行：\n\n「雨停了。我在茶馆门口等你。——律」\n\n纸条的边角被仔细地折过，像是主人犹豫了很久，才决定把它送出去。",
    "emotion": "warm",
    "next_node": "waiting"
   },
   "waiting": {
    "speaker": "narrator",
    "text": "你到的时候，他果然站在茶馆门口。手里拿着两把伞——一把自己撑着，一把收得好好的，递给你。\n\n晚霞把他的影子拉得很长。他看见你，先是怔了一下，然后弯起眼睛，露出一个有些生涩、却很明亮的笑容。",
    "emotion": "warm",
    "choices": [
     {
      "text": "「你等了很久吗？」",
      "next_node": "wait_long",
      "affection_change": 4
     },
     {
      "text": "「我们……去哪儿？」",
      "next_node": "where_to",
      "affection_change": 5
     },
     {
      "text": "（接过伞，什么都没问）",
      "next_node": "take_umbrella",
      "affection_change": 7
     }
    ]
   },
   "wait_long": {
    "speaker": "洛疏律",
    "text": "「没有很久。」他说，「就是茶馆里那壶茶，从泡开喝到凉透的时间。」\n\n他顿了顿，又补了一句，声音轻得像在自言自语：「……比我想象中，过得快。」",
    "emotion": "warm",
    "next_node": "walk_start"
   },
   "where_to": {
    "speaker": "洛疏律",
    "text": "「想带你去看一个地方。」他偏过头，晚霞落在他眼睛里，「江边。雨停以后的江边，很好看。」\n\n他停了一下，声音低下去：「……想让你也看看。」",
    "emotion": "warm",
    "next_node": "walk_start"
   },
   "take_umbrella": {
    "speaker": "洛疏律",
    "text": "他愣了一下，随即轻轻笑了一下，把伞放进你手里。他的指尖擦过你的手背，停顿了那么一瞬，又若无其事地收回去：\n\n「……好，那我们走吧。」",
    "emotion": "happy",
    "next_node": "walk_start"
   },
   "walk_start": {
    "speaker": "narrator",
    "text": "雨后的街道被洗得干净，空气里是泥土和青草的气息。晚霞烧红了半边天，把你们的影子并排拉得很长。\n\n他走在你左手边，步子比平时慢了一些，像是刻意在等你。",
    "emotion": "warm",
    "choices": [
     {
      "text": "「今天怎么想到约我出来？」",
      "next_node": "why_today",
      "affection_change": 4
     },
     {
      "text": "「雨停之后的傍晚，原来是这个味道。」",
      "next_node": "smell_rain",
      "affection_change": 5
     },
     {
      "text": "（悄悄牵住他的手）",
      "next_node": "hold_hand",
      "affection_change": 8
     }
    ]
   },
   "why_today": {
    "speaker": "洛疏律",
    "text": "「因为雨停了。」他回答得很认真，「雨天的时候，你总是来茶馆找我。所以我想，晴天的时候……至少有一次，该换成我来找你。」",
    "emotion": "warm",
    "next_node": "riverside"
   },
   "smell_rain": {
    "speaker": "洛疏律",
    "text": "「嗯。」他轻轻应了一声，「我从前最喜欢雨停后的这一刻——像是什么都可以重新开始。」\n\n他说完停了一下，声音低下去：「……今年开始，想跟你一起看。」",
    "emotion": "warm",
    "next_node": "riverside"
   },
   "hold_hand": {
    "speaker": "narrator",
    "text": "你的指尖碰到他的手背时，他明显顿了一下。\n\n然后他反手握住你的手，握得很紧，却一句话也没有问——像是这个动作，他也在心里练习过很多次了。",
    "emotion": "warm",
    "next_node": "riverside"
   },
   "riverside": {
    "speaker": "narrator",
    "text": "江边。晚霞铺在水面上，碎成一片流动的金。\n\n他停下脚步，望着远处，好一会儿没有说话。江风把他的衣摆吹起来，也把他鬓角的碎发吹乱了。",
    "emotion": "warm",
    "choices": [
     {
      "text": "「你在想什么？」",
      "next_node": "thinking",
      "affection_change": 3
     },
     {
      "text": "（从背后轻轻环住他）",
      "next_node": "riverside_hug",
      "affection_min": 75,
      "affection_change": 12
     },
     {
      "text": "「谢谢你，带我来看这些。」",
      "next_node": "thanks",
      "affection_change": 5
     }
    ]
   },
   "thinking": {
    "speaker": "洛疏律",
    "text": "「在想以前的事。」他说，「以前总是一个人来这里看水。那时候觉得，水看多少遍都是一个样子。」\n\n他转过头看你，晚霞在他眼底碎成细碎的光：「现在觉得，好像每一遍都不太一样了。」",
    "emotion": "warm",
    "next_node": "embrace_path"
   },
   "thanks": {
    "speaker": "洛疏律",
    "text": "他低下头，耳根有些红：「不用谢。」\n\n他想了想，声音很轻，却很认真：「以后每一个雨停的傍晚，都可以一起来。……如果，你也愿意的话。」",
    "emotion": "warm",
    "next_node": "embrace_path"
   },
   "riverside_hug": {
    "speaker": "narrator",
    "text": "你从背后环住他的时候，他整个人轻轻颤了一下。\n\n他没有挣开，反而缓缓转过身来，把脸埋在你肩头，声音闷闷的：「……我还以为，要等你很久，你才敢这样。」",
    "emotion": "warm",
    "next_node": "embrace_hold"
   },
   "embrace_hold": {
    "speaker": "洛疏律",
    "text": "他回抱住你，手臂环过你的肩，收得很紧，又带着一种小心翼翼的温柔。江风从你们身侧吹过去，把晚霞吹得碎碎的。\n\n「……真好。」他说，「下雨天有你，雨停的傍晚也有你。」",
    "emotion": "warm",
    "next_node": "kiss_choice"
   },
   "embrace_path": {
    "speaker": "narrator",
    "text": "他转过身，在江边和你面对面站着。晚风把他要说的话吹得有些散，他却说得很认真。\n\n他忽然往前凑近了一点，又在半步的距离停住，耳根红透：「我……可以吗。」",
    "emotion": "warm",
    "next_node": "kiss_choice"
   },
   "kiss_choice": {
    "speaker": "洛疏律",
    "text": "他望着你，眼神比晚霞还要亮。江风很大，吹得他衣角猎猎作响，他却没有动，只是安静地、认真地等着你的回答。",
    "emotion": "warm",
    "choices": [
     {
      "text": "「可以。」（踮起脚，吻住他）",
      "next_node": "kiss_1",
      "affection_min": 90,
      "affection_change": 10
     },
     {
      "text": "「……下次吧。」（摇摇头，牵住他的手）",
      "next_node": "later",
      "affection_change": 3
     }
    ]
   },
   "kiss_1": {
    "speaker": "narrator",
    "text": "你吻住他的时候，晚霞刚好烧到最盛。江面一片鎏金，风从你们相触的唇边吹过。\n\n他先是怔住，随即闭上眼，轻轻托住你的脸，回应了这个吻。\n\n和茶馆里那个雨夜的吻不一样。那一个很轻、很小心，像是怕打碎什么；这一个却笃定、坦然——像是终于确认了彼此的心意，从此再也不用试探。",
    "emotion": "warm",
    "next_node": "kiss_2"
   },
   "kiss_2": {
    "speaker": "洛疏律",
    "text": "分开时，他的脸是红的，眼睛却是弯的。他没有说话，只是把额头轻轻抵在你额头上，鼻尖碰着你的鼻尖。\n\n良久，他才开口，声音里带着一点笑意：\n\n「……雨停真好。」\n\n「以后每一场雨停，我都想跟你在一起。」",
    "emotion": "warm",
    "next_node": "kiss_deep_1"
   },
   "later": {
    "speaker": "洛疏律",
    "text": "他先是怔了一下，随即弯起眼睛笑了。没有失望，只有一种温和的笃定：\n\n「好。」他说，「不急。雨停之后的日子，还很长很长。」\n\n他牵起你的手，十指交扣：「我们慢慢来。」",
    "emotion": "warm",
    "next_node": "epilogue"
   },
   "kiss_deep_1": {
    "speaker": "narrator",
    "text": "分开的时候，他的呼吸有些乱。但你没有退开。\n\n你的手从他的衣摆下沿探了进去，指尖触到他腰侧的那一刻，他整个人明显绷了一下——腰间的皮肤比想象中更烫，像是藏着整个夏天的温度。\n\n他没有躲。他只是轻轻吸了一口气，然后伸手扣住你的后脑，把你们之间那一点距离也吻没了。\n\n这一次的吻，比刚才更深。他的睫毛在你脸颊边微微颤动，像是风里的蝶翼，扣在你后脑的手指却收得很紧，像是怕你反悔。",
    "emotion": "warm",
    "next_node": "kiss_deep_2"
   },
   "kiss_deep_2": {
    "speaker": "洛疏律",
    "text": "好一会儿，他才松开你。他的脸是红的，呼吸是乱的，眼睛却是亮的——亮得像雨后的江面。\n\n他低头看了一眼你停留在他腰侧的手，没有把它拿出来，只是轻轻把自己的手覆上去，十指与你交握，声音哑哑的：\n\n「……你的手，好凉。」\n\n「那你暖着。」你说。\n\n他耳根红透，却把你往怀里带了带：「嗯。我暖着。」\n\n他顿了顿，又小声补了一句，像是对你说，又像是说给自己听：「……一辈子都暖着。」",
    "emotion": "warm",
    "next_node": "wall_1"
   },
   "wall_1": {
    "speaker": "narrator",
    "text": "回程的路走到一半，他突然停下了。\n\n你还没来得及问怎么了，他已经转过身，把你轻轻抵在路边的青砖墙上。动作是生疏的——他显然没有做过这种事，撑在你耳侧的手臂微微发颤，却固执地没有松开。\n\n路灯的光从他身后照过来，把他的影子笼在你身上。他低着头看你，眼睫在光线下投下一小片阴影，呼吸有些不稳：\n\n「……我好像，变得贪心了。」",
    "emotion": "warm",
    "next_node": "wall_choice"
   },
   "wall_choice": {
    "speaker": "洛疏律",
    "text": "他说这句话的时候，声音很轻，却一字一字落得很实。\n\n「以前觉得，能在茶馆里等到你就够了。后来觉得，能牵到你的手就够了。再后来……」他顿了一下，耳根红得发烫，「……现在觉得，想把你藏起来，只让我一个人看。」\n\n他的气息近在咫尺。你想，你可以推开他——也可以，不推开。",
    "emotion": "warm",
    "choices": [
     {
      "text": "（反攻：反手扣住他的手腕，把他抵回墙上）",
      "next_node": "wall_counter_1",
      "affection_change": 10
     },
     {
      "text": "（顺从：抬手勾住他的脖子，由他吻下来）",
      "next_node": "wall_submit_1",
      "affection_change": 10
     }
    ]
   },
   "wall_counter_1": {
    "speaker": "narrator",
    "text": "你反手扣住他的手腕，用力一带——局势瞬间反转。\n\n他还没反应过来，后背已经轻轻撞上了对面的墙。他瞪大了眼睛，眼底的惊愕还没来得及成形，就被你靠近的气息淹没了。\n\n「……你、你——」他结结巴巴的，耳根连到脖颈都红透了，却没有任何挣扎的意思。\n\n他只是怔怔地看着你，喉结轻轻滚动了一下，声音哑得不像话：「……你什么时候，练的这手。」",
    "emotion": "warm",
    "next_node": "wall_counter_2"
   },
   "wall_counter_2": {
    "speaker": "洛疏律",
    "text": "你凑近他，他下意识地闭上眼，睫毛颤得厉害。\n\n但你没有吻他。你只是在他耳边轻笑了一声。\n\n他睁开眼，看见你眼底的笑意，先是一愣，随即又羞又恼地别过脸：「……你学坏了。」\n\n「跟谁学的？」他小声问。\n\n「跟你。」你说。\n\n他沉默了两秒，然后破罐子破摔似的重新转回来，伸手把你整个人圈进怀里，下巴抵在你发顶，声音闷闷的：「……那以后，我教你的东西，只许用在我身上。」",
    "emotion": "warm",
    "next_node": "wall_after"
   },
   "wall_submit_1": {
    "speaker": "narrator",
    "text": "你没有推开他。你抬起手，轻轻勾住他的脖子。\n\n他愣了一下，随即整个人都放松了下来——像是终于得到了许可。他低下头，额头抵着你的额头，鼻尖碰着你的鼻尖，声音带着一点不稳的呼吸：\n\n「……真的可以吗。」\n\n「嗯。」你说。\n\n他吻下来的时候，路灯刚好在你们头顶亮起。光落在他低垂的眼睫上，像落了满地的碎金。",
    "emotion": "warm",
    "next_node": "wall_submit_2"
   },
   "wall_submit_2": {
    "speaker": "洛疏律",
    "text": "这个吻比江边的那个更长、更深。他吻得认真，像是要把所有没说出口的话都融进这一个动作里。\n\n分开时，他的眼睛亮得惊人，脸上带着一种又满足又不好意思的表情。他低声说：\n\n「我好像……越来越离不开你了。」\n\n他顿了顿，又补了一句，声音小得像怕被风听走：「……不许笑我。」",
    "emotion": "warm",
    "next_node": "wall_after"
   },
   "wall_after": {
    "speaker": "narrator",
    "text": "路灯把你们的影子拉得很长，叠在一起，分不清谁是谁。\n\n他牵起你的手，十指交扣。指尖还有些抖，却握得很紧。\n\n「走吧。」他说，「回茶馆。给你泡壶茶。」\n\n「这么晚还喝茶？」\n\n「嗯。」他偏过头看你，眼里的笑意比路灯还亮，「睡不着也没关系。反正……以后每个晚上，我都有话想跟你说。」",
    "emotion": "warm",
    "next_node": "epilogue"
   },
   "epilogue": {
    "speaker": "narrator",
    "text": "回程的时候，天已经暗下来了。茶馆的灯亮着，风铃在夜风里轻轻响了一声。\n\n他把那把你没用过的伞挂在门边：「留着吧。」他说，「下次雨停，还用得上。」\n\n你忽然觉得，这间茶馆、这座小城、这些雨停之后的傍晚，都开始有了牵挂的重量。\n\n——番外·雨停之后·完——",
    "emotion": "warm",
    "next_node": null
   }
  }
 }

});
