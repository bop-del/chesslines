// The position key.
//
// A FEN has six fields; the last two — halfmove clock and fullmove number —
// record how you arrived, not what the position is. Dropping them is what makes
// transpositions merge: the same position reached by two move orders gets one
// key, and so one progress record.
//
// This is the format the Chess Programming Wiki calls EPD. Four projects
// converged on it independently (ChessTempo, Chessbook, OpeningTree,
// chessdriller) — see docs/research/opening-data-and-drilling.md.
//
// Castling rights and the en passant square stay: both change which moves are
// legal, so a position that differs in either genuinely is a different position.

export function key(fen) {
    return fen.split(' ').slice(0, 4).join(' ');
}
