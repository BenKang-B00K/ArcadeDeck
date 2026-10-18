// Blog art source of truth: scenes + alt text per post. Read by art-prompt.html (browser) and scripts/apply-blog-art.mjs (node).
// p = head poster, m = mid-post artwork, f = final artwork. s = scene (art prompt), a = alt text (shipped in <img alt>).
// Files: public/images/blog/<slug>-poster.webp | -mid.webp | -final.webp
window.BLOG_ART = {
  "welcome-to-the-arcadedeck-devlog": {
    p: { s: "A cozy neon workshop desk at night: an open notebook, a glowing patch-note scroll, a tiny arcade cabinet and a mug, with a trophy shelf behind. Deck, the small round robot mascot, sits on the desk holding a pencil, grinning at the camera.", a: "Deck the robot mascot at a neon desk with a notebook, patch notes and a tiny arcade cabinet" },
    m: { s: "Three floating holographic panels in a row: a scrolling patch-note list, a game-design blueprint with arrows and sketches, and a podium with three trophies. Deck hovers between them pointing at the blueprint.", a: "Three holographic panels showing patch notes, a design blueprint and a podium" },
    f: { s: "Deck waves from a small lit window of a glowing arcade cabinet while a road of light leads into the distance toward a horizon of more cabinets. Warm, welcoming, open-door mood.", a: "Deck waving from an arcade cabinet screen with a glowing path of cabinets ahead" }
  },
  "mastering-gem-merge-five-move-saving-patterns": {
    p: { s: "A tall glowing grid board of faceted gems in six colors, with a bright chain of merging gems running diagonally corner to corner and ending in a radiant crystal at the top. Rose-gold sparkle trail follows the chain.", a: "A gem board with a diagonal merge chain ending in a radiant crystal" },
    m: { s: "Close-up of a gem board corner: the four corner cells hold large calm gems locked in place like keystones, smaller gems cascade between them in neat diagonals. Soft arrows of light trace the diagonal.", a: "Corner gems anchoring a board while smaller gems line up along diagonals" },
    f: { s: "A single huge multi-faceted gem on a pedestal, tier-jump sparks spiraling upward, tiny pixel spectators silhouetted below holding a counter that shows a low number. Triumphant but calm.", a: "A giant tier-jump gem on a pedestal with sparks rising" }
  },
  "triangle-battle-couch-tournament-guide": {
    p: { s: "Four friends on a couch seen from behind in silhouette, each holding a differently colored controller (cyan, rose, yellow, green), facing a big TV where four glowing triangles clash on an arena. Tournament bracket glows faintly on the wall.", a: "Four friends on a couch with controllers facing a TV showing a triangle arena" },
    m: { s: "A neon tournament bracket projected as light lines on a wall, eight slots narrowing to a final, four colored triangle emblems traveling along the lines. A pizza box and four controllers on a table in the foreground.", a: "A glowing tournament bracket with four triangle emblems moving toward the final" },
    f: { s: "Winner triangle raised on a small podium with a golden crown, confetti in cyan and rose, three other triangles bowing playfully beside it. Couch cushions and controllers scattered in the foreground.", a: "A crowned triangle on a podium with confetti and three other triangles beside it" }
  },
  "hall-of-fame-march-2026-recap": {
    p: { s: "A grand neon hall of fame: a long gallery with three glowing pedestals, gold, silver and bronze trophies, and a wall of tiny framed score plates. A laurel ornament glows overhead.", a: "A neon hall of fame gallery with gold, silver and bronze trophies on pedestals" },
    m: { s: "Overhead view of a podium with three steps, tiny pixel characters on each step celebrating, a scoreboard of rising bars in the background and a spotlight cone from above.", a: "A three-step podium with celebrating pixel characters and a rising bar scoreboard" },
    f: { s: "A calendar page torn away to reveal the next month, a golden trophy glinting at the edge, a road of light stretching toward a new gallery door marked with a glowing arrow. Anticipation mood.", a: "A calendar page turning to the next month beside a golden trophy" }
  },
  "galaxy-launch-idle-design-keeping-progression-meaningful": {
    p: { s: "A rocket launching from a small planet into a huge spiral galaxy, glowing orbital rings around the planet showing progression tiers. A sleeping moon with a tiny clock icon sits at the lower left to hint at offline progress.", a: "A rocket launching from a small planet into a spiral galaxy with glowing orbital rings" },
    m: { s: "Diagram-like illustration: two glowing currency streams (cyan and rose) flowing through a split valve into two different vaults, one overflowing and capped, one steady. Clean schematic style with soft glow.", a: "Two glowing currency streams flowing into separate vaults through a valve" },
    f: { s: "A prestige moment: the whole galaxy folds into one bright star that becomes the seed of a new rocket on a launchpad. A path of milestone markers glows behind it.", a: "A galaxy collapsing into a bright star that seeds a new rocket" }
  },
  "polygon-invasion-td-launch-notes-opening-strategy": {
    p: { s: "A low-poly top-down battlefield: a winding path with a chokepoint, faceted towers in cyan, rose and yellow, and waves of polygonal enemies (triangles, squares, hexagons) marching toward the base. Tower shots draw bright lines.", a: "A low-poly tower defense battlefield with faceted towers and polygon enemies at a chokepoint" },
    m: { s: "Close view of a chokepoint where the path narrows to a gate: three different towers in a tight cluster covering it, enemy shapes bunching up and bursting into shards. Range rings softly glow under the towers.", a: "Three different towers covering a narrow chokepoint as polygon enemies shatter" },
    f: { s: "The base core glowing intact at dusk, a few defeated polygon shards fading, tower silhouettes standing guard, a rising score ribbon of light curling upward. Satisfied end-of-wave mood.", a: "A glowing base core guarded by towers after a cleared wave" }
  },
  "designing-roguelikes-for-the-browser-run-length-and-meta-progression": {
    p: { s: "Three doorways side by side, each leading to a different roguelike world: a dice-strewn war table, a starship in a void, a colosseum arena. A central hooded wanderer silhouette stands before them holding a lantern.", a: "A wanderer before three doorways leading to dice, space and colosseum worlds" },
    m: { s: "A stylized hourglass filled not with sand but with a tiny run: a character running through rooms inside the top bulb, drifting down as glowing embers into a lower bulb shaped like a skill tree.", a: "An hourglass with a tiny run inside turning into a glowing skill tree below" },
    f: { s: "A tombstone with a glowing sprout growing from it, roots forming a skill tree, and a new hero stepping up to a door of light. Death into growth, bittersweet but hopeful.", a: "A glowing sprout growing from a tombstone with roots shaped like a skill tree" }
  },
  "void-survivor-now-on-steam": {
    p: { s: "A lone fighter ship in deep void surrounded by a huge swarm of enemy ships, a wide ring of orbiting weapons and beams, a distant planet. Wide cinematic scale, a controller glyph-shaped nebula in the corner.", a: "A lone ship surrounded by an enemy swarm with a ring of orbiting weapons in deep space" },
    m: { s: "The Engineering Bay: a ship hanging in a gantry with glowing upgrade modules, holographic blueprints, robotic arms installing parts. Industrial sci-fi workshop in violet and cyan.", a: "A ship in an engineering bay gantry receiving glowing upgrade modules" },
    f: { s: "A PC monitor and a game controller on a desk both showing the same ship, with a thin glowing beam linking the two, a starry window behind. Quiet, welcoming mood.", a: "A monitor and controller on a desk with a ship in a starry window behind" }
  },
  "mythic-defenders-tower-defense-card-driven-design": {
    p: { s: "A hand of five glowing hero cards fanned in the foreground, each showing a mythic hero silhouette (archer, mage, tank, healer, summoner). Behind the cards, the heroes stand on a battlefield facing a monster horde.", a: "A fanned hand of hero cards in front of mythic heroes facing a monster horde" },
    m: { s: "A summoning moment: one hero card lifts off the hand, shatters into light and the hero appears at a chokepoint, tanks in front and casters in rear, mana crystals floating in the air.", a: "A hero card turning into a summoned hero at a chokepoint with mana crystals" },
    f: { s: "A deck of cards seen from the side forming a staircase that rises toward a glowing throne with a crown on it. Heroes climbing the cards. Climb-the-ladder mood.", a: "A staircase made of cards rising toward a glowing throne" }
  },
  "timing-chef-update-rush-hour-and-recipe-expansion": {
    p: { s: "A busy neon kitchen counter in rush hour: a chef character mid-flip with a pan, ingredients in the air, a big circular timing gauge with a bright green perfect-window arc, order tickets hanging in a row.", a: "A chef flipping a pan above a circular timing gauge with a green perfect window" },
    m: { s: "Eight recipe plates arranged in an arc on a long counter, each with a different dish (sushi, burger, ramen, tacos, pizza, curry, pancakes, skewers), steam rising in neat swirls, heat gauge glowing at the edge.", a: "Eight different dishes arranged in an arc on a counter with rising steam" },
    f: { s: "The kitchen after the rush: a clean counter with a gold plate and a rose-red heat gauge cooling to blue, the chef giving a tired thumbs up, tickets all cleared. Warm relieved mood.", a: "A calm kitchen with a gold plate, cooling heat gauge and a chef giving thumbs up" }
  },
  "falling-dodger-launch-neon-freefall-arcade": {
    p: { s: "Vertical composition seen from above a shaft: a tiny glowing skydiver falling between neon obstacle bars, rings of light passing by, speed streaks, a distance counter glow far below. Dizzying depth.", a: "A tiny glowing skydiver falling down a neon shaft between obstacle bars" },
    m: { s: "Mid-fall close view: the faller threads a narrow gap between two sliding bars, ghost afterimages show the path, two upcoming obstacles faintly lit ahead to show reading ahead.", a: "A faller threading a narrow gap between two neon bars with afterimages behind it" },
    f: { s: "The faller lands on a soft cushion of light at the bottom of the shaft, a long trail of glowing rings above it showing the whole fall, a ranking ribbon unfurling to the side.", a: "A faller landing on a glowing cushion beneath a long trail of rings" }
  },
  "gate-of-hell-rise-of-demons-v2-update": {
    p: { s: "Pixel-art style gate of hell: an enormous demonic stone gate with fire-red glow, towers on the path defending it, ember-lit demons approaching through a cracked wasteland. Dramatic dark red and violet palette.", a: "A pixel-art demonic stone gate glowing red with towers defending a cracked wasteland" },
    m: { s: "Split image: the left half is the old rough sketch version of the gate, the right half the polished repainted version, a vertical seam of light between them. Paintbrush and palette floating at the seam.", a: "A before-and-after split of the gate artwork with a seam of light between" },
    f: { s: "Soul fragments, small cyan flames, floating up out of the gate into a night sky, a lone tower on the hill lit by them, a depth gauge rising to a glowing number.", a: "Cyan soul fragments rising from the gate to a lone tower on a hill" }
  },
  "flux-tower-defense-now-on-steam": {
    p: { s: "Hex-grid battlefield with energy towers connected by glowing relay lines forming a living network, cyan plasma streams, polygonal flux enemies advancing toward a central core. Steam capsule art feel.", a: "Energy towers linked by glowing relays on a hex grid as flux enemies advance" },
    m: { s: "Top-down close-up of the energy network: towers as nodes, relay cables with pulses of light traveling between them, one node highlighted as the source and others brightening in sequence.", a: "A close-up of towers as nodes with pulses of light traveling along relay cables" },
    f: { s: "A Steam-style wishlist moment: the core crystal floating above the hex grid with a heart-shaped glow, cyan towers lined behind, stars above. Inviting, premium look.", a: "A glowing core crystal above a hex grid with towers lined up behind" }
  },
  "neon-stack-launch-one-tap-tower-stacking": {
    p: { s: "A tall tower of neon blocks stacked against a night sky, each layer a different glowing color, a sliding block approaching from the side just above the top, sparkle on a perfectly aligned layer.", a: "A tall tower of neon blocks with a sliding block approaching the top" },
    m: { s: "Close side view of two blocks meeting with a perfect overlap: a bright ring pulse at the contact line, tiny trimmed slivers falling away on one side, a combo counter glow.", a: "Two neon blocks meeting in a perfect overlap with a ring pulse and trimmed slivers" },
    f: { s: "The finished tower disappearing into clouds with a crown-shaped light on top, a rhythm waveform running along the base like a pulse, small stars. Satisfying peak.", a: "A very tall neon tower topped with a crown of light above the clouds" }
  },
  "kingdom-of-ashes-fallen-era-now-on-steam": {
    p: { s: "A dark fantasy ruined kingdom under an ash-filled sky, a hero in tattered armor holding a fan of glowing elemental cards (fire, ice, lightning), an ember-lit forge in the background, floating ash particles.", a: "A hero holding elemental cards before a ruined kingdom under an ash sky" },
    m: { s: "The Forge: an anvil with glowing embers, a card laid upon it being hammered into a brighter version, sparks showering, a pile of grey ash in a bowl at the side.", a: "A card being hammered on a glowing anvil in the forge with sparks and ash" },
    f: { s: "Three cards chained by a ring of elemental resonance, fire, ice and lightning arcs connecting them over a dark kingdom silhouette, a lone banner in the wind.", a: "Three elemental cards linked by resonance arcs above a dark kingdom silhouette" }
  },
  "ashen-keys-launch-typing-as-a-weapon": {
    p: { s: "A glowing keyboard in the foreground whose keys launch beams of light upward at a towering ash-grey monster with a regenerating green aura, floating letters like projectiles. Dark ash and cyan palette.", a: "A glowing keyboard firing beams at a towering regenerating monster" },
    m: { s: "A combo meter shown as a burning fuse curling around a keyboard, flames brighter near the keys, a decay shadow creeping on the fuse's far end. Four small currency icons orbit.", a: "A burning combo fuse curling around a keyboard with four currency icons orbiting" },
    f: { s: "A skill deck of ten rune tiles fanned in a ring around a single key, three highlighted, the monster silhouette shrinking behind. Calm confident mood.", a: "Ten rune tiles fanned in a ring around a single glowing key" }
  },
  "barrack-defense-launch-notes-a-defense-game-with-no-towers": {
    p: { s: "A fortress made of barracks buildings forming walls, soldiers pouring out of their doors in neat lines, shields and spears, an enemy horde with different armor types approaching. Isometric view, no towers.", a: "Barracks acting as walls while soldiers pour out to meet an approaching horde" },
    m: { s: "Armor diagram scene: a spear, a hammer and an arrow each striking a different armored enemy (light, heavy, shielded) with different spark colors, small damage icons floating above.", a: "A spear, hammer and arrow each hitting differently armored enemies with different sparks" },
    f: { s: "A barracks at dusk with a stopwatch glowing in the sky counting eight seconds, units standing at ease, a flag raised, calm before the next wave.", a: "A barracks at dusk with a glowing stopwatch in the sky and units at ease" }
  },
  "shadow-runner-demo-and-steam-launch": {
    p: { s: "A cloaked shadow runner mid-dash through a dark ruined corridor, a three-phase combo trail of cyan, violet and rose slashes behind, glowing curse sigils on the wall. Dynamic low angle.", a: "A cloaked runner dashing through a ruined corridor with a three-color combo trail" },
    m: { s: "Three poses of the runner in sequence (strike, dash, finisher) as translucent ghost frames across one image, each with its own colored slash arc, a single button glyph above the first.", a: "Three ghost frames of the runner showing strike, dash and finisher with colored arcs" },
    f: { s: "A cursed pact scroll unfurled in front of a Steam-style door of light at the end of the corridor, the runner's silhouette waiting beside it. Chapter 1 end, promise of more.", a: "A pact scroll before a door of light with the runner waiting beside it" }
  },
  "fruit-frenzy-v1-3-shoot-the-bombs": {
    p: { s: "Colorful fruits (apple, orange, watermelon, strawberry) tumbling from the sky into a basket, a small gun shooting a bomb mid-air in a puff of confetti smoke, a rare ammo crate glowing. Juicy and bright with a violet-cyan night backdrop.", a: "Fruits falling into a basket while a gun shoots a bomb mid-air" },
    m: { s: "Close view of fruits with motion personalities: one hopping, one skidding, one hovering with little motion lines, and a seeker bomb curving toward the basket with a red trail.", a: "Fruits hopping, skidding and hovering while a seeker bomb curves toward a basket" },
    f: { s: "The basket full of fruit with a gold bronze-silver-gold tier badge floating above it, a phone and a laptop both showing the sharp game, sparkles. Cheerful finish.", a: "A full fruit basket with a gold badge above it beside a phone and a laptop" }
  },
  "personal-bests-and-mastery-badges": {
    p: { s: "A wall of glowing badges in bronze, silver and gold arranged like a trophy case, each badge with a small different game icon, a level ring in the center growing with light. A browser window outline frames the case.", a: "A trophy case of bronze, silver and gold game badges inside a browser window" },
    m: { s: "A message in a bottle metaphor: a tiny glowing score orb travels from a game window along a thin light line into a profile card that stores it, with a lock icon showing it stays local.", a: "A glowing score orb traveling from a game window into a locked profile card" },
    f: { s: "A staircase of 31 tiers glowing from bronze through diamond, a tiny player climbing it with a lantern, the top lit by a diamond. Quiet personal-achievement mood.", a: "A player climbing a glowing staircase of tiers toward a diamond" }
  },
  "flux-tower-defense-free-web-edition-waves-1-10": {
    p: { s: "A maze of glowing walls built from towers across a hex arena, ten wave markers glowing along the edge, random loadout cards drifting in the sky, a browser window cut-out revealing the arena.", a: "A glowing tower maze on a hex arena with ten wave markers and loadout cards" },
    m: { s: "Three loadout cards face-down, one flipped to reveal a tower with elemental attribute colors (fire, ice, lightning), the maze path forming behind it.", a: "Three loadout cards with one flipped to reveal an elemental tower" },
    f: { s: "Wave 10 boss silhouette, huge and polygonal, at the end of the maze, a thin line of towers glowing in front of it, a clickable disaster icon pulsing. Tense, climactic.", a: "A huge polygonal wave 10 boss at the end of a glowing tower maze" }
  },
  "mythic-defenders-v6-4-new-heroes-pause-continue-phones": {
    p: { s: "Five new mythic heroes in a heroic lineup: a multi-armed goddess, a giant island hero with a fishhook, a lotus muse with a lute, a witch on a hut with chicken legs, a storm goddess. Epic fantasy key art, glowing runes.", a: "Five mythic heroes in a heroic lineup including a multi-armed goddess and a storm goddess" },
    m: { s: "Five new monsters silhouetted in a row on a glowing battlefield, each with a distinct threat aura, a small wizard hand pointing at each with a tactic icon (pause icon, shield).", a: "Five new monsters in silhouette each with a distinct aura on the battlefield" },
    f: { s: "A phone in portrait showing a battlefield beside a glowing pause-play icon and a continue arrow, heroes standing on the phone's frame edge. Friendly modern finish.", a: "A phone showing a battlefield beside pause and continue icons" }
  },
  "trade-tycoon-launch-twelve-cities-five-eras": {
    p: { s: "A floating night island with twelve city districts from tribal tents to industrial chimneys, caravans and ships connecting them with glowing trade lines, lanterns, an aurora above. Isometric diorama.", a: "A floating night island of twelve cities from tribal camps to industrial towns linked by trade routes" },
    m: { s: "Timeline strip in five panels (stone camp, bronze town, castle, harbor city, factory city) along a curving road, a caravan of camels and carts passing through each, coin sparkles.", a: "Five eras of a city from camp to factory along a road with a trade caravan" },
    f: { s: "A merchant on a hill looking over the finished island at dawn, objective tree glowing in the sky as constellations, a ledger and a scale of coins at his side.", a: "A merchant overlooking the island at dawn with an objective tree in the sky" }
  },
  "phone-link-couch-games-on-your-own-phones": {
    p: { s: "Four phones floating around a living-room TV, each connected by a glowing dotted line to the center, each phone showing a different colored screen. A four-letter room code glows as four abstract glyph tiles above the TV.", a: "Four phones linked by glowing lines to a living-room TV with a room code above" },
    m: { s: "A phone being used as a controller: split view of a thumb on a touchscreen with a joystick and button, and a small carton racing marble on the TV. Wi-Fi arcs rising from a router.", a: "A phone used as a controller linked to a TV via Wi-Fi arcs" },
    f: { s: "Friends on a sofa at night, faces lit by phone glow, laughing, one phone slightly dropped with a reconnect ring pulsing around it. Cozy, social mood, no faces in detail.", a: "Friends on a sofa lit by phone glow with one phone reconnecting" }
  },
  "one-minute-auto-battle-launch-bank-or-push": {
    p: { s: "A tiny cute slime in the center of a circular arena shooting automatically in all directions, a ring of enemies closing in, a huge minute-countdown ring glowing around the arena, three tiered cards floating above.", a: "A slime auto-shooting in a circular arena with a countdown ring and three cards" },
    m: { s: "The minute checkpoint: a fork of two glowing doors, one marked with a rocket icon (push on), one with a vault icon (bank PARTS), the slime standing at the crossroads holding a bag of parts.", a: "A slime at a crossroads between a push-on door and a vault for banking parts" },
    f: { s: "The 46-node upgrade tree as a glowing constellation with the slime on a small platform at its base, elemental pillars flaming at each side, a pact ribbon curled around. Epic but cute.", a: "A slime beneath a constellation-style upgrade tree flanked by elemental pillars" }
  },
  "animal-racing-launch-couch-kart-racer": {
    p: { s: "Chibi animals (fox, panda, rabbit, frog) in wind-up toy karts drifting around a colorful track with key-shaped wind-up keys on their backs, turbo flames, confetti, four-way split-screen frames in the corners.", a: "Chibi animals in wind-up toy karts drifting around a colorful track" },
    m: { s: "A drift mini-turbo moment: a kart sliding with blue-then-orange sparks at the wheels, a banana-like rude item flying from another kart, a Joker card hovering mid-swap.", a: "A toy kart drifting with colored sparks as an item flies by and a Joker card swaps places" },
    f: { s: "Podium of four animals with a bill tab hanging off the loser kart as playful stakes, fireworks, a checkered flag, a phone icon in each corner. Party mood.", a: "A podium of four racing animals with a bill tab and checkered flag" }
  },
  "emotion-act-acting-party-game-situation-cards": {
    p: { s: "A living room party with friends acting out dramatic emotions (surprise, anger, joy, fear) in comic poses, a single phone floating in the middle projecting three cards. Warm lights, stage-curtain edge.", a: "Friends acting out dramatic emotions around a floating phone showing three cards" },
    m: { s: "Close-up of three emotion cards fanned, each with a bold expressive face emoji-like icon, a stopwatch ring with five-second and fifteen-second segments, hands on knees below.", a: "Three emotion cards fanned beside a timer ring and hands on knees" },
    f: { s: "Curtain call: all players bowing on a small stage under a spotlight, a score trophy shaped like a mask of comedy and tragedy, confetti. Big-group celebration.", a: "Players bowing on a small stage with a comedy and tragedy mask trophy" }
  },
  "ladder-game-marble-racing-party-decision-makers": {
    p: { s: "Split scene: left half a Ghost Leg ladder of glowing rails and rungs with animal tokens climbing, right half marbles racing down a 3D ramp. Both halves share a bill-splitting receipt in the middle.", a: "A Ghost Leg ladder on one side and marbles racing down a ramp on the other" },
    m: { s: "The Joker swap: two animal tokens on adjacent ladder lanes trading places in a swirl of light, a Joker card spinning above. Three heights of ladders sketched behind.", a: "Two animal tokens swapping lanes on a ladder with a Joker card spinning above" },
    f: { s: "A big dinner table with a bill and a spinning marble result board, a winning animal paying with a cheerful shrug, everyone laughing. Warm, humorous mood.", a: "A dinner table with a bill and a result board as a winning animal shrugs" }
  },
  "unholy-tempo-launch-strike-on-the-beat": {
    p: { s: "A demon sovereign with great horns and a black-gold cape facing a radiant holy champion across a gate of light, two glowing rhythm lanes sweeping toward the viewer, beat notes as flaming runes. Epic fantasy-rhythm key art.", a: "A demon sovereign facing a radiant holy champion across two glowing rhythm lanes" },
    m: { s: "Two lanes viewed from the player's side: top lane notes as strike sigils, bottom lane notes as parry shields, a hit line with burst effect, sound-wave ribbons curling around the lanes.", a: "Two rhythm lanes with strike sigils and parry shields at a burst hit line" },
    f: { s: "The throne of the Underrealm with a crown, 243 stars scattered above like constellations, the sovereign silhouette seated, gamepad glyph glowing on an arm of the throne.", a: "A demon throne under a sky of 243 stars with a gamepad glyph on the armrest" }
  }
};
