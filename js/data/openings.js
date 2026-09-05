// The starter list: what Felix chooses from.
//
// Hand-picked, because the catalogue cannot do this job. The CC0 dataset has
// 3,810 openings including "Sicilian Defense: King David's Opening" (2. Ke2)
// and four separate Myers Attacks — exhaustive, not curated. A nine-year-old
// needs a dozen real openings with names he will actually hear.
//
// Every line here is proved legal by test/openings.test.mjs, and again in both
// browsers by scripts/verify.mjs. Add one only with its test passing: a wrong
// line teaches something false, authoritatively, to someone with no reason to
// doubt it.
//
// The ECO code is the one the CC0 dataset gives for the most specific named
// position this line passes through — the longest dataset entry that is a
// prefix of our pgn. A code names a position, so a line that continues further
// carries a different code than its own first moves do: this line is C54, while
// the Italian Game as a family is C50. test/openings.test.mjs derives each code
// from scripts/lib/tsv/ and fails if one drifts, so do not edit these by hand.
//
// The idea sentence names a *plan*, never an evaluation. "+0.3" means nothing
// to a child; "get the bishop pointing at f7" is something he can act on.

export const OPENINGS = [
    {
        id: 'italian-game',
        eco: 'C54',
        name: { en: 'Italian Game', de: 'Italienische Partie' },
        idea: {
            en: 'Point the bishop at f7, the weakest square in Black’s camp, and castle early.',
            de: 'Der Läufer zielt auf f7, das schwächste Feld bei Schwarz — und dann schnell rochieren.',
        },
        intro: {
            en: 'One of the oldest openings there is, and still one of the first anyone learns. You put your bishop on c4, where it stares at f7 — the one square next to Black’s king that only the king defends. Then you build a big pawn centre behind it.',
            de: 'Eine der ältesten Eröffnungen überhaupt — und immer noch eine der ersten, die man lernt. Dein Läufer geht nach c4 und zielt auf f7: das einzige Feld neben dem schwarzen König, das nur der König selbst deckt. Dahinter baust du dann ein starkes Bauernzentrum auf.',
        },
        side: 'w',
        pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4',
        moves: [
            {
                san: 'e4',
                en: 'Straight into the middle. The pawn takes a centre square, watches d5, and opens the door for both your bishop and your queen.',
                de: 'Direkt in die Mitte. Der Bauer nimmt ein Zentrumsfeld, bewacht d5 und macht den Weg frei für Läufer und Dame.',
            },
            {
                san: 'e5',
                en: 'Black does the same thing, and it is the move that gets most in your way: it stops you playing d4 for free.',
                de: 'Schwarz macht es genauso — und das ist der Zug, der dich am meisten stört: Er verhindert, dass du einfach so d4 spielen kannst.',
            },
            {
                san: 'Nf3',
                en: 'Develop and attack at the same time. The knight goes for the e5 pawn, guards d4, and clears a square so you can castle soon.',
                de: 'Entwickeln und angreifen zugleich. Der Springer greift den Bauern auf e5 an, deckt d4 und macht Platz zum Rochieren.',
            },
            {
                san: 'Nc6',
                en: 'Black defends the pawn with a piece that also covers d4 — one move doing two jobs.',
                de: 'Schwarz verteidigt den Bauern mit einer Figur, die zugleich d4 deckt — ein Zug, zwei Aufgaben.',
            },
            {
                san: 'Bc4',
                en: 'The Italian bishop. From here it aims at f7, the weakest square Black has, because only the king is guarding it.',
                de: 'Der italienische Läufer. Von hier zielt er auf f7 — das schwächste Feld bei Schwarz, weil nur der König es deckt.',
            },
            {
                san: 'Bc5',
                en: 'Black copies you. Bringing the bishop out before the knight keeps the queen watching g5, so Black can castle in peace.',
                de: 'Schwarz macht es dir nach. Erst der Läufer, dann der Springer — so behält die Dame g5 im Blick und Schwarz kann in Ruhe rochieren.',
            },
            {
                san: 'c3',
                en: 'The quiet move that makes the next one work. Right now Black guards d4 three times and you only twice — so play d4 immediately and you just lose the pawn. This evens the count.',
                de: 'Der leise Zug, der den nächsten erst möglich macht. Im Moment deckt Schwarz d4 dreimal, du nur zweimal — spielst du d4 sofort, verlierst du den Bauern einfach. Das hier gleicht die Rechnung aus.',
            },
            {
                san: 'Nf6',
                en: 'Black develops and hits your e4 pawn, getting ready to castle as well.',
                de: 'Schwarz entwickelt sich, greift deinen Bauern auf e4 an und bereitet ebenfalls die Rochade vor.',
            },
            {
                san: 'd4',
                en: 'Now it works. Two pawns side by side in the middle, and Black has to take them or hand you the whole centre.',
                de: 'Jetzt geht es. Zwei Bauern nebeneinander in der Mitte — und Schwarz muss zuschlagen oder dir das ganze Zentrum überlassen.',
            },
        ],
    },
    {
        id: 'ruy-lopez',
        eco: 'C78',
        name: { en: 'Ruy Lopez', de: 'Spanische Partie' },
        idea: {
            en: 'Pin the knight that defends e5, then build a big centre behind it.',
            de: 'Den Springer fesseln, der e5 deckt, und dahinter ein starkes Zentrum aufbauen.',
        },
        side: 'w',
        pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O',
    },
    {
        id: 'scotch-game',
        eco: 'C45',
        name: { en: 'Scotch Game', de: 'Schottische Partie' },
        idea: {
            en: 'Break the centre open at once, before Black has finished developing.',
            de: 'Das Zentrum sofort öffnen, bevor Schwarz fertig entwickelt ist.',
        },
        side: 'w',
        pgn: '1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bc5',
    },
    {
        id: 'vienna-game',
        eco: 'C27',
        name: { en: 'Vienna Game', de: 'Wiener Partie' },
        idea: {
            en: 'Develop the queenside knight first and keep the f-pawn free to advance.',
            de: 'Zuerst den Damenspringer entwickeln und den f-Bauern frei halten.',
        },
        side: 'w',
        pgn: '1. e4 e5 2. Nc3 Nf6 3. Bc4 Nxe4 4. Qh5',
    },
    {
        id: 'kings-gambit',
        eco: 'C39',
        name: { en: 'King’s Gambit', de: 'Königsgambit' },
        idea: {
            en: 'Give up a pawn to rip the centre open and attack fast.',
            de: 'Einen Bauern opfern, um das Zentrum aufzureißen und schnell anzugreifen.',
        },
        side: 'w',
        pgn: '1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4',
    },
    {
        id: 'london-system',
        eco: 'D02',
        // The standard move order — knight before bishop. Starting 2. Bf4 is
        // the *Accelerated* London (D00), a different animal and a different
        // code.
        name: { en: 'London System', de: 'Londoner System' },
        idea: {
            en: 'Set the same solid shape up every game: the bishop comes out before the e-pawn moves.',
            de: 'Jede Partie derselbe solide Aufbau: Der Läufer kommt raus, bevor der e-Bauer zieht.',
        },
        side: 'w',
        pgn: '1. d4 d5 2. Nf3 Nf6 3. Bf4 e6 4. e3 Bd6',
    },
    {
        id: 'queens-gambit',
        eco: 'D50',
        name: { en: 'Queen’s Gambit', de: 'Damengambit' },
        idea: {
            en: 'Offer the c-pawn to pull Black’s d-pawn away and own the centre.',
            de: 'Den c-Bauern anbieten, um den d-Bauern wegzulocken und das Zentrum zu beherrschen.',
        },
        intro: {
            en: 'You offer a pawn — but not really. If Black takes it, you can win it straight back, and meanwhile Black’s centre pawn has been dragged off to the side. Games like this are slower and quieter than 1. e4 games: less chasing, more building.',
            de: 'Du bietest einen Bauern an — aber nicht wirklich. Wenn Schwarz zugreift, holst du ihn dir zurück, und der schwarze Zentrumsbauer ist unterwegs an den Rand gewandert. Solche Partien sind ruhiger als die nach 1. e4: weniger jagen, mehr aufbauen.',
        },
        side: 'w',
        pgn: '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5',
        moves: [
            {
                san: 'd4',
                en: 'The pawn takes the middle and is already guarded by your queen. It also opens a diagonal for your dark-squared bishop.',
                de: 'Der Bauer nimmt die Mitte und wird schon von deiner Dame gedeckt. Außerdem öffnet er die Diagonale für deinen schwarzfeldrigen Läufer.',
            },
            {
                san: 'd5',
                en: 'Black mirrors you and takes control of e4, so you cannot get two pawns side by side in the middle.',
                de: 'Schwarz spiegelt dich und kontrolliert e4 — damit du nicht zwei Bauern nebeneinander ins Zentrum bekommst.',
            },
            {
                san: 'c4',
                en: 'Here is the offer. Take it, and your d-pawn leaves the centre it was guarding — which is exactly what you want. This is why it is barely a real gambit: the pawn usually comes back.',
                de: 'Hier ist das Angebot. Nimmst du es, verlässt dein d-Bauer das Zentrum, das er bewacht hat — und genau darum geht es. Deshalb ist es kaum ein echtes Gambit: Der Bauer kommt meistens zurück.',
            },
            {
                san: 'e6',
                en: 'Black says no thanks and props up d5 with a pawn instead. It is solid — but it shuts in the bishop on c8, and getting that piece out stays a problem for the rest of the game.',
                de: 'Schwarz lehnt ab und stützt d5 lieber mit einem Bauern. Solide — aber der Läufer auf c8 sitzt jetzt fest, und ihn wieder ins Spiel zu bringen bleibt das ganze Spiel über ein Problem.',
            },
            {
                san: 'Nc3',
                en: 'Develop, and lean on d5 a second time. The knight also covers e4, in case you ever want to push that pawn.',
                de: 'Entwickeln und ein zweites Mal Druck auf d5 machen. Der Springer deckt außerdem e4 — falls du diesen Bauern später vorziehen willst.',
            },
            {
                san: 'Nf6',
                en: 'Black develops and defends d5 again, and stops you playing e4 at the same time.',
                de: 'Schwarz entwickelt sich, verteidigt d5 erneut und verhindert gleichzeitig dein e4.',
            },
            {
                san: 'Bg5',
                en: 'The bishop pins the knight to the queen behind it — and that knight is one of the pieces guarding d5. It cannot run away without leaving the queen in the open.',
                de: 'Der Läufer fesselt den Springer an die Dame dahinter — und dieser Springer ist einer der Verteidiger von d5. Er kann nicht weglaufen, ohne die Dame ungedeckt zu lassen.',
            },
        ],
    },
    {
        id: 'scandinavian-defense',
        eco: 'B01',
        name: { en: 'Scandinavian Defense', de: 'Skandinavische Verteidigung' },
        idea: {
            en: 'Challenge the e-pawn immediately — little to memorise, and you almost always reach the same setup.',
            de: 'Den e-Bauern sofort angreifen — wenig auswendig zu lernen, und du kommst fast immer zum selben Aufbau.',
        },
        intro: {
            en: 'You hit White’s centre pawn on move one, before developing anything. White almost always takes, and you win the pawn straight back with the queen. There is not much to memorise here, and you nearly always get the setup you wanted — which is why it suits players who are still learning.',
            de: 'Du greifst den weißen Zentrumsbauern schon im ersten Zug an, bevor du irgendetwas entwickelst. Weiß schlägt fast immer, und du holst dir den Bauern mit der Dame sofort zurück. Es gibt hier wenig auswendig zu lernen, und du bekommst fast immer den Aufbau, den du wolltest — deshalb passt sie gut, wenn man noch lernt.',
        },
        side: 'b',
        pgn: '1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6',
        moves: [
            {
                san: 'e4',
                en: 'White starts in the middle: the pawn grabs a centre square and frees the queen and the light-squared bishop.',
                de: 'Weiß beginnt in der Mitte: Der Bauer nimmt ein Zentrumsfeld und macht Dame und weißfeldrigen Läufer frei.',
            },
            {
                san: 'd5',
                en: 'You go straight at it, on move one, before developing a single piece. White has to deal with this now.',
                de: 'Du gehst sofort dagegen vor — im ersten Zug, bevor du eine einzige Figur entwickelst. Weiß muss sich jetzt darum kümmern.',
            },
            {
                san: 'exd5',
                en: 'White takes, and almost everyone does — it is the only move that really tries for an advantage. White’s e-pawn has now left the board, which is good news for you: your pieces get room.',
                de: 'Weiß schlägt, und das machen fast alle — es ist der einzige Zug, der wirklich auf Vorteil spielt. Der weiße e-Bauer ist damit vom Brett, und das ist gut für dich: Deine Figuren bekommen Platz.',
            },
            {
                san: 'Qxd5',
                en: 'You take the pawn back at once. Yes — this is the queen coming out early, which you have probably been told not to do. Here it is the price of the opening: you lose a little time, and you get an easy, free position in return.',
                de: 'Du holst dir den Bauern sofort zurück. Und ja — das ist die Dame früh im Spiel, wovon man dir wahrscheinlich abgeraten hat. Hier ist es der Preis der Eröffnung: Du verlierst etwas Zeit und bekommst dafür eine freie, bequeme Stellung.',
            },
            {
                san: 'Nc3',
                en: 'This is where White collects that time back: the knight develops and attacks your queen in the same move, so you have to react.',
                de: 'Hier holt sich Weiß die Zeit zurück: Der Springer entwickelt sich und greift dabei deine Dame an — du musst reagieren.',
            },
            {
                san: 'Qa5',
                en: 'The queen steps aside to a square where she is doing something. From a5 she looks down the diagonal at e1 — and the moment White plays d4, the knight on c3 is pinned in front of the king.',
                de: 'Die Dame weicht auf ein Feld aus, wo sie etwas tut. Von a5 schaut sie die Diagonale bis e1 hinunter — und sobald Weiß d4 spielt, ist der Springer auf c3 vor dem König gefesselt.',
            },
            {
                san: 'd4',
                en: 'White builds the big centre. It is the natural move — and it is also the one that opens your diagonal and switches your pin on.',
                de: 'Weiß baut das große Zentrum. Der natürliche Zug — und zugleich der, der deine Diagonale öffnet und deine Fesselung scharf schaltet.',
            },
            {
                san: 'Nf6',
                en: 'Develop, and cover d5 so the white knight cannot jump there and chase your queen again.',
                de: 'Entwickeln — und d5 decken, damit der weiße Springer nicht dorthin springt und deine Dame erneut jagt.',
            },
        ],
    },
    {
        id: 'caro-kann',
        eco: 'B15',
        name: { en: 'Caro-Kann Defense', de: 'Caro-Kann-Verteidigung' },
        idea: {
            en: 'Back up the d-pawn with the c-pawn first, so the bishop can still escape to f5.',
            de: 'Den d-Bauern zuerst mit dem c-Bauern stützen — so kommt der Läufer noch nach f5 heraus.',
        },
        side: 'b',
        pgn: '1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5',
    },
    {
        id: 'french-defense',
        eco: 'C17',
        name: { en: 'French Defense', de: 'Französische Verteidigung' },
        idea: {
            en: 'Build a solid pawn chain, then attack its base with c5.',
            de: 'Eine feste Bauernkette bauen und dann ihre Basis mit c5 angreifen.',
        },
        side: 'b',
        pgn: '1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5',
    },
    {
        id: 'sicilian-defense',
        eco: 'B54',
        name: { en: 'Sicilian Defense', de: 'Sizilianische Verteidigung' },
        idea: {
            en: 'Trade a wing pawn for a centre pawn and play for the counter-attack.',
            de: 'Einen Flügelbauern gegen einen Zentrumsbauern tauschen und auf Gegenangriff spielen.',
        },
        side: 'b',
        pgn: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3',
    },
    {
        id: 'kings-indian-defense',
        eco: 'E70',
        name: { en: 'King’s Indian Defense', de: 'Königsindische Verteidigung' },
        idea: {
            en: 'Let White build a big centre, then attack it with the bishop on g7 and the e-pawn.',
            de: 'Weiß ein großes Zentrum bauen lassen und es dann mit dem Läufer auf g7 und dem e-Bauern angreifen.',
        },
        side: 'b',
        pgn: '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6',
    },
];
