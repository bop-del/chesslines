# 3D pieces: three.js, and what it costs

Evidence for #31 — a spike asking whether 3D artwork beats the flat SVG set at
board size, and what live three.js costs on Felix's phone.

**Status: not yet run.** Fields marked `TODO (phone):` need a device; per
ADR 0006 nothing in this repo can produce them.

Nothing here has shipped. `js/vendor/three/` is imported by nothing under
`js/` — a test asserts it.

## The model

Borrowed rather than modelled, to hold artwork quality fixed. A first Blender
knight would be mediocre, and a mediocre model is a verdict on the model, not
on 3D.

| | |
|---|---|
| Source | **tediuminteractive, "Chess Set"** — https://sketchfab.com/3d-models/chess-set-11aef53278434ca7b1c373b470cb5ee0 |
| Licence | **CC BY 4.0** — attribution required, goes beside the file |
| Polycount | ~8k triangles for the knight (45,622 for all six pieces) |
| `.glb` size | **TODO: measure after extracting the knight** |

**Untextured, flat matte black and white** — which is why it was chosen over a
better-licensed alternative.

### Why not the CC0 one

**Poly Haven's "Chess Set"** (https://polyhaven.com/a/chess_set) is CC0, needs
no attribution, and its knight is **2,662 triangles** — a third of this one.
On licence and polycount it wins outright, and it is the fallback if the
Sketchfab download proves awkward.

It was not chosen because it is **photoreal marble**, and that quietly changes
the question. Against Cburnett's flat vectors, a marble knight asks *"does
photoreal texture beat flat artwork"*. The flat matte one asks *"does
three-dimensional geometry beat flat artwork"* — and dimensionality is the
property that would survive into a piece modelled here later. A win on marble
would flatter a route whose actual endpoint is an untextured model of our own.

It is the same confound that put a borrowed model on this spike in the first
place, arriving on a different axis. The flat set is the better-controlled
experiment, and it removes the PBR textures (1k–8k normal/ARM/diffuse) that
would otherwise have to be vendored alongside the mesh.

**Not** rejected for share-alike: the pieces this app already ships are
Cburnett, **CC BY-SA 3.0**, and `library-research.md` settled that — share-alike
binds the images, not our code, and the repo carries the attribution. A CC BY-SA
3D model would put rendered PNGs in exactly that same position, which is a place
this project already lives.

CC0 is preferred for the duller reason: fewest obligations attached to a control
we expect to throw away. Attribution, where a licence needs it, goes beside the
file as `js/vendor/chess.js.LICENSE` and the header of `css/pieces.svg` do.

**Genuinely rejected:** "royalty free", "free for personal use", and the
Sketchfab Standard licence — none of which survive a public repo, whatever the
download button says. CC BY-NC-SA is out for the same reason
`library-research.md` rejects the Staunty set.

Blender and a Blender MCP are a future interest, deliberately kept off this
spike's critical path.

**A licence trap found while searching, recorded so it is not walked into
later:** "Knight chess piece" by Dominic Baker on Sketchfab is marked CC BY, but
its description places it in a set whose parent licence is **Sketchfab
Standard**. A CC-BY part carved out of a Standard-licensed whole is
inconsistent; avoid it.

**Dead ends, so nobody re-searches them:** Khronos glTF-Sample-Assets (397
models, no chess), Quaternius, Kenney, ambientCG. Sketchfab's CC0-and-
downloadable chess pool is three museum photogrammetry scans at 180k–500k
triangles — useless here. Of OpenGameArt's 21 3D chess entries only
tunakron's ships glTF; the rest are `.blend`/FBX/OBJ needing a Blender export.

## Size

three.js `0.185.1`:

| | raw | gzipped |
|---|---|---|
| `three.module.min.js` | 356 KB | **TODO: measure** |
| `three.core.min.js` | 376 KB | **TODO: measure** |
| `GLTFLoader.js` | 112 KB | **TODO: measure** |
| **three.js total** | **844 KB** | **TODO** |
| the `.glb` | TBD | ~ (already compressed; gzip adds little) |

Measure gzipped over Pages, not locally:

```
curl -sI -H 'Accept-Encoding: gzip' https://bop-del.github.io/chesslines/js/vendor/three/three.module.min.js
```

`docs/research/catalogue-source.md` verified that Pages does serve
`content-encoding: gzip`.

### The comparison that matters

#31 originally called this **factor 53** — 844 KB against the 16 KB of
`css/pieces.svg`. That is wrong twice: three.js is infrastructure rather than
artwork, and raw bytes are not what a phone downloads.

| | raw | gzipped |
|---|---|---|
| the whole app today | ~750 KB | **~100 KB** (catalogue measured at 61 KB; rest estimated — **TODO: measure**) |
| three.js + loader | 844 KB | ~200 KB estimated — **TODO: measure** |

Roughly two to three times the app, over the wire. Raw size still matters as a
proxy for **parse cost**, which gzip does not reduce.

## Time-to-visible — the headline

Time from tap to the knight on screen, over Pages, on cellular. It subsumes
transfer, parse and GPU setup, and it is the number the recommendation rests on.

Loaded **eagerly**, as `index.html` imports `Board.js`. A lazy upgrade from a
flat board would flatter the number and is a decision about the app that #31
does not make.

- **TODO (phone):** time-to-visible, cellular
- **TODO (phone):** time-to-visible, Wi-Fi (for contrast)
- **TODO (phone):** does it render on iOS Safari at all

## The size ladder

The same knight, SVG and live 3D, at 40 / 60 / 80 / 120 px, both themes, on
real board squares from `css/board.css`.

A single 40px pairing cannot answer the question: at 40px almost everything is
a silhouette, and the Cburnett set was designed to survive that. At 400px 3D
wins and the comparison is dishonest. The ladder finds the crossover instead.

- **TODO (phone):** at what size does 3D stop paying?
- **TODO (phone):** screenshots, both themes

A board square on a 375px screen is about 40px today. If the crossover sits
above that, **making the board bigger** is a cheaper answer than either 3D
route — though #13 and #29 already spent effort on legibility at the current
size, so it is not free either.

## Heat and battery

Render on demand: draw once, redraw only when the position changes. A
`requestAnimationFrame` loop on a static board is a strawman nobody would ship.

The real unknown is whether iOS Safari keeps the GPU awake compositing a WebGL
canvas with no draw calls.

- **TODO (phone):** does the phone warm over a five-minute session?

## Render-to-PNG — the follow-up

Render the model to a PNG and keep the flat board. Pieces look
three-dimensional, the browser gets an image, the cost is a few KB, and no rule
is touched. It is also the likelier winner.

**Out of scope for #31**, which keeps one variable. The consequence binds what
that spike may conclude:

> If live 3D looks better than the SVG, the spike has **not** shown whether a
> PNG of the same model would have looked equally good. Its recommendation may
> be *"3D artwork is worth having"*. It may not be *"ship live three.js"*.

A future PNG route would make piece artwork a **generated asset**, which is a
real liability worth naming: `scripts/build-catalogue.mjs` is the precedent for
generated output, but "the pieces are built by a script that needs Blender"
is a heavier dependency than that one.

## Findings

**TODO** — written after the phone walk, with the screenshots that justify it.
The decision and its fence go in an ADR; this file holds the evidence.
