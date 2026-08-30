# Niasguts Já Está Rica? Project Guidelines

## Product Contract

- Keep the site a small, playful, dependency-free static page.
- The question asks whether the displayed identity is rich. The answer is always `NÃO`.
- Pick one display name per page load and use it in both the heading and browser title.
- Keep these exact name options: `amanda`, `nana`, `niasguts`, `nia`, `vito corleone de saia`, `diabo loiro`, `demonio de porto alegre`, `barista de porto alegre`, `don corleone de saia`, and `pobre lazarenta`.
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
- Keep the main page and every dialog within the viewport without document or dialog scrollbars at normal zoom, from `320x568` portrait and `568x320` landscape through desktop sizes.

## Casino Joke

- The `FIQUE RICA!` button opens the coffee-themed fictional slot machine.
- Render the machine as procedural WebGL geometry with the pinned local Three.js 0.185.1 modules under `assets/vendor/`.
- Keep the camera in a fixed three-quarter view showing the front, top, and right side. Do not add cursor or touch tilt.
- Keep readable text and native controls in an untransformed HTML layer aligned over the WebGL cabinet. Do not put text under rotated, scaled, filtered, or translucent ancestors.
- Use the external right-side 3D lever as the only spin control. Pointer and touch input must raycast only against the visible arm and knob meshes; the base and surrounding rectangle must never activate it.
- Keep a clipped `1x1` native button for screen readers, Tab, Enter, and Space. Transfer its focus indication to the 3D lever and do not show a rectangular outline.
- Pull the lever forward and down around its horizontal pivot. Do not animate it sideways.
- Build three physical eight-symbol cylindrical reels and stop them sequentially with deceleration. Use five ordinary faces plus mystery gift, one-chip, and two-chip faces.
- Load the shared 3D module only when the casino or achievement gallery first opens; do not load it eagerly on the main page. Keep a functional HTML reel fallback for WebGL or module failure.
- Start each visitor with five virtual chips stored under `niasguts-casino-fichas-v1`. Charge one chip before each spin and keep the balance visible only inside the casino.
- Resolve each spin from one exclusive roll: 50% returns one chip, 25% pays two chips, 12.5% lands a mystery-gift achievement, and 12.5% is an ordinary loss. Keep ordinary losses free of matching triples.
- When the balance reaches zero, disable the lever and show `SEM FICHAS — MINIGAME EM BREVE`. Do not add a reset or emergency chip path.
- Award `esposa do nenepira`, `prima do vaper`, `bólos`, `350 reais`, and `lanche do subway` only through mystery-gift triples. Award locked prizes before repeats; allow repeats only after all five are unlocked.
- Build a procedural chibi tiger opposite the lever. Dance at 30 fps only while the casino is visible, use a stronger victory dance during jackpots, and keep it static under reduced motion.
- Keep jackpot UI blocking until `CONTINUAR` or `Escape`. Show a large crisp title, the prize name, new/repeat badge, flash, rays, confetti, pooled 3D particles, cabinet lights, tiger celebration, and the enlarged matching 3D prize.
- Keep the main financial verdict as `NÃO` after every prize.
- Keep coffee references in the symbols or failure messages.
- Use `assets/musica.mp3` as looped casino-only music at 25% initial volume.
- Start enabled music when the casino opens, pause it when the casino closes, and provide play/pause and volume controls inside the modal.
- Preserve a manual pause while the page remains open. Do not add other music or sound effects without explicit approval.
- Track the visitor's desired music state separately from `HTMLMediaElement.paused`. Invalidate stale `play()` promises so they cannot undo a newer pause request.
- Reflect actual playback through the media `play`, `pause`, and `error` events.
- Do not add money balances, payments, gambling links, or a real-money disclaimer.

## Achievements

- Keep a main-page `CONQUISTAS` button with a live unlocked count.
- Show five permanent 3D pedestals with procedural mystery crates while locked. Reveal the matching procedural ring, generic feminine chibi, layered cake, `R$350` suitcase, or logo-free sandwich and its prize name only after the matching mystery-gift trinca lands.
- Render the achievement models in one WebGL canvas aligned with native HTML labels. Float and rotate unlocked prizes at 20 fps only while visible; keep locked mysteries static and honor reduced motion.
- Raise a new prize from the payout tray for 1.1 seconds. Bounce and glow a repeated prize for 450 milliseconds.
- After all five prizes are unlocked, keep the cabinet gold and pink and show `COLEÇÃO COMPLETA`.
- Store known unlocked prize IDs as a JSON array under `niasguts-achievements-v1` in `localStorage`.
- If browser storage is unavailable, preserve progress for the current visit and show the persistence warning. Do not add a reset control.

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
