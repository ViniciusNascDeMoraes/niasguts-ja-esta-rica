# Niasguts Já Está Rica? Project Guidelines

## Product Contract

- Keep the site a small, playful, dependency-free static page.
- The question asks whether the displayed identity is rich. The answer is always `NÃO`.
- Pick one initial display name per page load, then let the visitor edit that name inline for the current visit.
- Limit the editable display name to 32 characters, update its dynamic consumers while typing, and do not persist it across reloads.
- Use the current display name in the heading, browser title, dramatic-verdict label, certificate preview, PNG, and native share text.
- Keep these exact name options: `amanda`, `nana`, `niasguts`, `nia`, `vito corleone de saia`, `diabo loiro`, `demonio de porto alegre`, `barista de porto alegre`, `don corleone de saia`, `pobre lazarenta`, and `fernando collor de calcinha`.
- Do not add a separate barista badge. The barista reference belongs only in the random name list and in the coffee jokes.

## Time and Identity

- Use 04 October 2000 at 12:16 in Porto Alegre as the birth instant.
- Use the `America/Sao_Paulo` IANA time-zone rules for Porto Alegre.
- Show completed years plus days, hours, minutes, and seconds since the latest birthday.
- Refresh on real second boundaries. Do not show milliseconds.

## Visual Design and Media

- Keep the Marin Kitagawa theme and the current hair-and-school-uniform palette.
- Define colors as semantic custom properties in `:root`. Reuse those properties everywhere else.
- Do not add heart decorations.
- Store the eight approved Marin GIFs under `assets/gifs/`. Do not use Tenor embeds, iframes, or an external embed script.
- Select two distinct local GIFs once per page visit on viewports wider than `34rem`.
- On viewports at or below `34rem`, hide the GIF area and do not create image elements or request GIF files.
- Keep accessible alternative text and link each displayed GIF to its original Tenor page for attribution.
- Keep the delivered nanaBet artwork under `assets/images/casino/` with descriptive filenames. Do not resize, regenerate, or eagerly request it from the main page.
- Keep the six delivered `1086x1448` prize-card PNGs unchanged under `assets/images/casino/prize-cards/`: five fronts and one mystery back. Use their descriptive filenames and retain a CSS fallback for every card.
- Keep `nanabet-palette-reference.png` as a local design reference only. The existing semantic CSS palette remains authoritative and must not be replaced by the reference sheet colors without a new explicit decision.
- Keep the main page and every dialog within the viewport without document or dialog scrollbars at normal zoom, from `320x568` portrait and `568x320` landscape through desktop sizes.

## Coffee Oracle

- Keep a compact `☕ ORÁCULO` toggle in the main actions and reveal its reading in an inline panel below those actions.
- Keep exactly 366 unique literal messages, each no longer than 120 characters, balanced across coffee, barista, wealth, nanaBet, Gojo, Marin, Porto Alegre, and affectionate absurdity.
- Select messages from a fixed leap-year calendar using the current month and day in `America/Sao_Paulo`. Keep every calendar date stable between years and reserve its own message for 29 February.
- Update an open reading when Porto Alegre reaches a new date. Do not add rerolls, date browsing, persistence, sound, external data, or additional assets.
- Start the panel collapsed on every page load. The same accessible button must open and close it while keeping `aria-expanded` truthful.

## Dramatic Verdict and Certificate

- Keep the main verdict as a native `NÃO` button whose visible answer never changes. Advance through the five fixed audit messages on activation, hold the final stamped result for three seconds, then reset automatically.
- Keep the dramatic audit replayable and visit-local. Use only semantic-palette CSS effects, announce each complete message politely, and replace motion with static emphasis under reduced motion.
- Keep a visible `CERTIFICADO` button in the main actions. It opens a fullscreen, viewport-contained Certificate of Non-Wealth personalized with the current editable display name.
- Create one Porto Alegre issue date and exact time with seconds plus an `NR-AAAAMMDD-HHMMSS` protocol on the first opening and reuse them until reload. Do not persist certificate state.
- If the display name changes after issuance, update the existing certificate name and invalidate only its generated PNG; keep its issue date, time, and protocol.
- Keep a crisp responsive HTML preview and generate the downloadable A4-landscape PNG locally from a hidden canvas. Read all export colors from the semantic CSS palette and do not add assets or dependencies.
- Show readable cursive `Tigrinho` and `nanaBet` signatures in both the HTML preview and generated PNG, alongside their printed roles and the existing coffee seal.
- Always offer `BAIXAR PNG`; expose native file sharing only when the browser reports support. Keep cancellation silent and report real export failures accessibly.

## Casino Joke

- The `FIQUE RICA!` button opens the coffee-themed fictional slot machine.
- Render the machine as procedural WebGL geometry with the pinned local Three.js 0.185.1 modules under `assets/vendor/`.
- Keep the camera in a fixed three-quarter view showing the front, top, and right side. Do not add cursor or touch tilt.
- Keep readable text and native controls in an untransformed HTML layer aligned over the WebGL cabinet. Do not put text under rotated, scaled, filtered, or translucent ancestors.
- Use the external right-side 3D lever as the only spin control. Pointer and touch input must raycast only against the visible arm and knob meshes; the base and surrounding rectangle must never activate it.
- Keep a clipped `1x1` native button for screen readers, Tab, Enter, and Space. Transfer its focus indication to the 3D lever and do not show a rectangular outline.
- Pull the lever forward and down around its horizontal pivot. Do not animate it sideways.
- Build three physical six-symbol cylindrical reels and stop them sequentially with deceleration. Use five ordinary faces plus the mystery-gift face.
- Texture those six reel faces with the delivered coffee, tiger, diamond, cherries, seven, and gift PNGs. Load them only when the casino first opens, and retain each existing character as its individual 3D and HTML fallback.
- Show the delivered nanaBet PNG in the sharp HTML marquee while retaining the native `nanaBet` heading as its accessible and visual load-failure fallback. Use the delivered star-centered chip PNG in the balance and one-chip rule, and the delivered gift PNG in the achievement rule.
- Load the shared 3D module only when the casino first opens; do not load it eagerly on the main page or from the achievement gallery. Keep a functional HTML reel fallback for WebGL or module failure.
- Start each visitor with five virtual chips stored under `niasguts-casino-fichas-v1`. Charge one chip before each spin and keep the balance visible only inside the casino.
- Make the first eligible spin per browser land the mystery-gift triple for `pé da prima do vaper`. Persist the consumed bait under `niasguts-casino-bait-v1`; if storage is unavailable, consume it for the current visit only.
- After the guaranteed first result, resolve each spin from one exclusive roll: 12.5% lands a mystery-gift achievement and 87.5% is an ordinary loss. Every spin spends one chip; only the classroom lesson replenishes chips. Keep ordinary losses free of matching triples.
- When the balance reaches zero, disable the lever and show `SEM FICHAS` with the `GANHAR FICHAS NA AULA` button. Do not add a reset or emergency chip path.
- Award `esposa do nenepira`, `pé da prima do vaper`, `bólos`, `355 reais + juros`, and `lanche do subway` only through mystery-gift triples. Keep the stable `prima-vaper` and `350-reais` saved IDs. Award locked prizes before repeats; allow repeats only after all five are unlocked.
- Show ready, spinning, and ordinary-loss messages in a centered non-blocking HTML card for two seconds, then retain the same text in the compact bottom result panel. Do not use jackpot effects for these messages.
- Keep the two-line symbol legend in a compact square at the lower right, separate from the result panel and lever.
- Build a procedural chibi tiger opposite the lever with exactly two eyes, visible inner ears, two short forehead stripes, and four cheek-only whiskers. Do not add smile strokes or hair-like geometry below its nose. Dance at 30 fps only while the casino is visible, use a stronger victory dance during jackpots, and keep it static under reduced motion.
- Keep jackpot UI blocking until `CONTINUAR` or `Escape`. Show a large crisp title, the prize name, new/repeat badge, flash, rays, confetti, pooled 3D particles, cabinet lights, tiger celebration, and the enlarged matching HTML prize card.
- Anchor the retained jackpot effects to the camera and keep the centered, untransformed HTML prize card in front of every decorative effect. Keep its copy and confirmation control crisp above the WebGL layer.
- Once a spin selects a winning outcome, preload only its matching prize front. Do not request any prize card merely by opening the casino.
- Keep the main financial verdict as `NÃO` after every prize.
- Keep coffee references in the symbols or failure messages.
- Use `assets/musica.mp3` as looped casino-only music at 25% initial volume.
- Start enabled music when the casino opens, pause and reset it to the beginning when the casino closes, and provide play/pause and volume controls inside the modal.
- Preserve a manual pause while the page remains open. Do not add other music or sound effects without explicit approval.
- Track the visitor's desired music state separately from `HTMLMediaElement.paused`. Invalidate stale `play()` promises so they cannot undo a newer pause request.
- Reflect actual playback through the media `play`, `pause`, and `error` events.
- Do not add money balances, payments, gambling links, or a real-money disclaimer.

## Visual Novel Lesson

- Open the fullscreen classroom only from the zero-chip casino state. Close the casino first so its WebGL loop and music pause and reset through the normal lifecycle.
- Keep the two classroom backgrounds, six transparent Gojo poses, and two opaque finale CGs under `assets/images/gojo/`. The delivered artist briefing is no longer part of the repository.
- Do not request any classroom image before the lesson first opens. Select the portrait or landscape background by viewport orientation, preload every pose once inside the lesson, retain the previous decoded pose until its replacement is ready, and keep the CSS classroom as a failure fallback.
- Request the matching portrait or landscape finale CG only after the fifth correct answer. Keep `gojo-reward.png` visible until the CG decodes, then replace the background and sprite with the full scene. A load failure or stale completion must leave the reward pose functional.
- During the finale, keep the crisp HTML dialogue and reward button over the CG. Anchor the panel at the lower right in landscape and across the bottom in portrait without obscuring the five offered chips.
- Use `caring`, `neutral`, and `reassuring` for the three introduction lines; `teaching` for questions and retries; `praise` for correct feedback; `reassuring` for wrong feedback; and `reward` for the completed lesson.
- Overlap the non-finale dialogue box over the bottom of all six transparent poses so their baked lower edge stays hidden. Keep the stage clipped, the dialogue above the character, and the finale layout unaffected.
- Address the learner as Nana. Keep Gojo affectionate, reassuring, and lightly romantic without making a wrong answer punitive.
- Generate a fresh five-question lesson on every entry, covering addition, subtraction, multiplication, and exact division. Present exactly three large numeric alternatives.
- A wrong answer gives a specific hint and retries the same generated question without losing progress. A correct answer advances only after its feedback line.
- Completing all five questions unlocks one guarded `RECEBER 5 FICHAS` action. Add exactly five chips to the existing persistent casino balance, then reopen the casino with the reward message emphasized.
- Closing with the dialog button or `Escape` awards nothing, returns to the zero-chip casino, and resets the lesson. Allow another fresh lesson whenever the balance later reaches zero.
- Render dialogue with a 28-millisecond visual typewriter. Enter, Space, or a click finishes the current line before advancing. Announce only the complete line to assistive technology and show text immediately under reduced motion.
- Keep the speaker name, dialogue, answer choices, and continue button about 25% larger than their original presentation. Leave the classroom title and progress text compact.
- Do not add lesson persistence, music, or sound effects. Keep the classroom within the same viewport containment requirements as every other dialog.

## Achievements

- Keep a main-page `CONQUISTAS` button with a live unlocked count.
- Show five permanent illustrated-card slots. Use the mystery-back card while locked, then reveal the matching delivered front and its HTML prize name only after the matching mystery-gift trinca lands.
- Request the mystery back and only the currently unlocked fronts when the gallery first opens; never request card art from the main page. Keep a previously decoded card visible until its replacement is ready.
- Float unlocked card art only while visible, keep locked mysteries static, animate a new reveal for 1.1 seconds or a repeat for 450 milliseconds, and honor reduced motion.
- Show the delivered landscape or portrait achievement-room background behind the full gallery according to viewport orientation. Request it only when achievements first open and retain the existing gradient when it cannot load.
- After all five prizes are unlocked, keep the cabinet gold and pink and show `COLEÇÃO COMPLETA`.
- Store known unlocked prize IDs as a JSON array under `niasguts-achievements-v1` in `localStorage`.
- If browser storage is unavailable, preserve progress for the current visit and show the persistence warning. Do not add a reset control.

## Secret Achievement Cheat

- Open the unadvertised cheat dialog only with an unmodified `F3` press while the main page is unobstructed. Do not show a visible hint or reveal its code in patch notes.
- Accept `gojopelado` after trimming and case-folding. A valid code unlocks all five stable achievement IDs, uses the normal achievement storage path, closes the cheat, and opens the gallery at `5/5` without changing chips or showing a jackpot.
- Show exactly `código inválido.` after a wrong entry. Closing with its button or `Escape` clears both the field and feedback.
- If storage is unavailable, keep the cheat unlocks for the current visit and expose the existing gallery persistence warning.

## Footer and Releases

- Keep the Twitch credit to `@vapercarioca`.
- Keep the donation sentence linked to `https://pixie.gg/niagott` in a new tab with `noopener noreferrer`.
- Show only the current version in the footer. Do not show a patch-notes button or keyboard hint.
- Open or close the complete release history with `P` or `Shift+P`, without Ctrl, Alt, or Meta, from the main page. Keep `Escape` and the dialog close button for closing it.
- Paginate release history newest-first with three releases per page, previous/next buttons, and Left/Right Arrow navigation.
- Treat functional changes as releases. Do not count commits that only remove or recreate `CNAME`.
- Keep this release mapping:
  - `0.1`: `d81287e` - initial wealth counter.
  - `0.2`: `ba96227` - Porto Alegre correction and heart removal.
  - `0.3`: `f448c5e` - millisecond counter.
  - `0.4`: `5266e4c` - first Marin GIF embeds.
  - `0.5`: `f1d3968` - eight-GIF pool, second-level counter, and Twitch credit.
  - `0.6`: `bda8a4b` - randomized display name.
  - `0.7`: `513f0fe` - Marin color palette.
  - `0.8`: `17b4b7a` - coffee-themed always-losing casino.
  - `0.9`: `339b279` - barista name variation.
  - `1.0`: `3005242` - redundant casino disclaimer removed.
  - `1.1`: `b8cb05d` - birth time corrected to 12:16.
  - `1.2`: `593a920` - Pixie donation link.
  - `1.3`: local GIFs, mobile GIF removal, and visible patch notes.
  - `1.4`: Pixie wording and patch-note copy refinements.
  - `1.5`: 3D casino reels, lever control, staggered animation, and casino music.
  - `1.6`: complete 3D cabinet, mystery prizes, persistent achievements, and secret `P` patch notes.
  - `1.7`: WebGL casino, physical side lever, sharp HTML controls, fixed music pause, and 3D trophy cabinet.
  - `1.8`: fullscreen responsive screens, persistent chips, five procedural prizes, blocking jackpots, dancing 3D tiger, paginated secret notes, and mesh-only lever raycasting.
  - `1.9`: corrected chibi tiger face and camera-centered jackpot prizes layered in front of every decorative effect.
  - `1.10`: nanaBet branding, font-independent one-chip reels, top-right audio controls, simplified odds, and reliable casino and music reopening.
  - `1.11`: prominent ordinary-result cards, lower-right legend, one-time guaranteed first prize, and the procedural `pé da prima do vaper` model.
  - `1.12`: zero-chip Gojo visual-novel lesson, five generated math questions, five-chip reward, and artist briefing for the future local artwork.
  - `1.13`: local orientation-aware classroom artwork, six contextual Gojo poses, and removal of the two hair-like strokes below the tiger's nose.
  - `1.14`: removed classroom kicker, simplified the refunded-chip message, and enlarged visual-novel reading and action text.
  - `1.15`: orientation-aware Gojo finale CG shown only after the fifth correct classroom answer.
  - `1.16`: removed the one-chip refund result, leaving six reel faces, 12.5% achievements, 87.5% ordinary losses, and dialogue-overlapped Gojo pose framing.
  - `1.17`: local nanaBet logo, illustrated chip and reel symbols, plus orientation-aware achievement-room backgrounds with lazy loading and fallbacks.
  - `1.18`: constrained illustrated chip and legend icons in both dimensions so their compact panels no longer stretch across the viewport.
  - `1.19`: stable decoded two-frame crossfade from the non-animated reward pose to the orientation-aware finale CG, with a full-width portrait dialogue panel.
  - `1.20`: inline Coffee Oracle with 366 unique fixed calendar-day messages selected under Porto Alegre time-zone rules.
  - `1.21`: five-stage replayable dramatic `NÃO` audit and a personalized local Certificate of Non-Wealth with PNG download and supported native sharing.
  - `1.22`: visit-local inline display-name editing synchronized with the question, browser title, dramatic verdict, and every certificate output.
  - `1.23`: interest-adjusted `355 reais + juros` prize plus exact Porto Alegre certificate time and readable Tigrinho and nanaBet signatures in HTML and PNG.
  - `1.24`: illustrated prize cards replaced the displayed 3D trophies, `fernando collor de calcinha` joined the randomized names, and an unadvertised achievement cheat was added.
- Update the footer version, patch notes, and this mapping together for each future user-visible release.

## Architecture and Delivery

- Keep page markup in root `index.html`, styles in root `styles.css`, page behavior in root `app.js`, and Three.js presentation in root `casino-3d.mjs`.
- Keep `CNAME` set to `niasguts.viniciuspirasoft.com`.
- Keep the site compatible with direct GitHub Pages hosting from `main` without a build step.
- Three.js 0.185.1 is the only approved third-party runtime dependency. Keep both official module files and `THREE-LICENSE.txt` local and pinned; do not replace them with a CDN import.
- Do not add other frameworks, package managers, build tools, analytics, backends, or third-party dependencies without explicit approval.
- Keep dependency-free tests under `tests/` using native `node:test` and the validation workflow under `.github/workflows/`.
- Before a requested release, run `node --check app.js`, `node --check casino-3d.mjs`, `node --test tests/site.test.mjs`, and `git diff --check`; validate local assets, staged scope, CI, and the published custom domain.
- Check responsive containment at `320x568`, `568x320`, `390x844`, `768x1024`, `1366x768`, and `1920x1080`. Do not use software-rendered headless WebGL for this project.
