# Niasguts Já Está Rica? Project Guidelines

## Product Contract

- Keep the site a small, playful, dependency-free static page.
- The question asks whether the displayed identity is rich. The answer is always `NÃO`.
- Pick one display name per page load and use it in both the heading and browser title.
- Keep these exact name options: `amanda`, `nana`, `niasguts`, `nia`, `vito corleone de saia`, `diabo loiro`, `demonio de porto alegre`, and `barista de porto alegre`.
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

## Casino Joke

- The `FIQUE RICA!` button opens the coffee-themed fictional slot machine.
- Allow unlimited spins, but never allow a jackpot or a winning result.
- Keep coffee references in the symbols or failure messages.
- Do not add balances, payments, gambling links, sound, or a real-money disclaimer.

## Footer and Releases

- Keep the Twitch credit to `@vapercarioca`.
- Keep the donation sentence linked to `https://pixie.gg/niagott` in a new tab with `noopener noreferrer`.
- Show the current version in the footer and open the complete release history through the `PATCH NOTES` dialog.
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
- Update the footer version, patch notes, and this mapping together for each future user-visible release.

## Architecture and Delivery

- Keep the application in the root `index.html`; keep `CNAME` set to `niasguts.viniciuspirasoft.com`.
- Keep the site compatible with direct GitHub Pages hosting from `main` without a build step.
- Do not add frameworks, package managers, build tools, analytics, backends, or third-party dependencies without explicit approval.
- Before a requested release, validate local asset paths, GIF signatures and dimensions, inline JavaScript syntax, `git diff --check`, staged scope, and the published custom domain.
