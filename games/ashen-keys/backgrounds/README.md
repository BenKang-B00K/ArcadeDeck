# Battle Backgrounds

One backdrop per 10-level block (`BALANCE.bossEvery = 10`). The background changes
every 10th level — levels 1–10 share `bg-01.png`, 11–20 share `bg-02.png`, … 91–100
share `bg-10.png`. Each block ends on a boss level, so the art escalates with depth.

## Files (drop here)

| File        | Levels   | Theme                       |
|-------------|----------|-----------------------------|
| bg-01.png   | 1–10     | Ashfall Threshold           |
| bg-02.png   | 11–20    | Cinder Barrows              |
| bg-03.png   | 21–30    | Emberwood                   |
| bg-04.png   | 31–40    | Slag Marsh                  |
| bg-05.png   | 41–50    | The Forgeworks              |
| bg-06.png   | 51–60    | Bonefire Catacombs          |
| bg-07.png   | 61–70    | Magma Caverns               |
| bg-08.png   | 71–80    | Voidcreep Hollows           |
| bg-09.png   | 81–90    | The Hollow Crown            |
| bg-10.png   | 91–100   | The Eternal Pyre Core       |

## Spec

- 16:9 landscape, **1920×1080 px**, full-bleed (NOT transparent — scenery is kept).
- Center + lower-middle kept calm/low-contrast so the enemy sprite + UI read on top.
- Served at `/backgrounds/<file>`. Index → file: `bg-{String(Math.floor((level-1)/10)+1).padStart(2,'0')}.png`.

Generation prompts: `docs/background-prompts.html`.
