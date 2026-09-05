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
// The ECO codes were read off the CC0 dataset for these exact move orders, not
// from memory — a code names a position, so a line that starts differently
// carries a different code. Check with scripts/lib/tsv/ before changing one.
//
// The idea sentence names a *plan*, never an evaluation. "+0.3" means nothing
// to a child; "get the bishop pointing at f7" is something he can act on.

export const OPENINGS = [
    {
        id: 'italian-game',
        eco: 'C50',
        name: { en: 'Italian Game', de: 'Italienische Partie' },
        idea: {
            en: 'Point the bishop at f7, the weakest square in Black’s camp, and castle early.',
            de: 'Der Läufer zielt auf f7, das schwächste Feld bei Schwarz — und dann schnell rochieren.',
        },
        side: 'w',
        pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4',
    },
    {
        id: 'ruy-lopez',
        eco: 'C60',
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
        eco: 'C44',
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
        eco: 'C25',
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
        eco: 'C30',
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
        eco: 'D06',
        name: { en: 'Queen’s Gambit', de: 'Damengambit' },
        idea: {
            en: 'Offer the c-pawn to pull Black’s d-pawn away and own the centre.',
            de: 'Den c-Bauern anbieten, um den d-Bauern wegzulocken und das Zentrum zu beherrschen.',
        },
        side: 'w',
        pgn: '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5',
    },
    {
        id: 'scandinavian-defense',
        eco: 'B01',
        name: { en: 'Scandinavian Defense', de: 'Skandinavische Verteidigung' },
        idea: {
            en: 'Challenge the e-pawn immediately — easy to learn, and it looks the same every game.',
            de: 'Den e-Bauern sofort angreifen — leicht zu lernen, und sieht jede Partie gleich aus.',
        },
        side: 'b',
        pgn: '1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6',
    },
    {
        id: 'caro-kann',
        eco: 'B10',
        name: { en: 'Caro-Kann Defense', de: 'Caro-Kann-Verteidigung' },
        idea: {
            en: 'Support the d-pawn with the c-pawn, so the light-squared bishop can still get out.',
            de: 'Den d-Bauern mit dem c-Bauern stützen — so kommt der weißfeldrige Läufer noch heraus.',
        },
        side: 'b',
        pgn: '1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5',
    },
    {
        id: 'french-defense',
        eco: 'C00',
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
        eco: 'B20',
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
            en: 'Let White take the centre, then hit it with the fianchettoed bishop and e5.',
            de: 'Weiß das Zentrum überlassen und es dann mit dem Fianchetto-Läufer und e5 angreifen.',
        },
        side: 'b',
        pgn: '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6',
    },
];
