# Kaaajka Donation Motion Engine

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users and purpose

Kaaajka uses this overlay in OBS; viewers see music-directed donation sequences and hear Tipply speech. Developers author and inspect motion in a local studio. This is a single-streamer product.

## Operating context

1920 × 1080 transparent browser source, targeting 60 FPS while a game runs. Reference hardware: Ryzen 7 7800X3D, RTX 3070, 16 GB RAM. Performance on that hardware and actual OBS compositing require operator verification.

## Capabilities and constraints

Preserve legacy websocket messages, FIFO queue, acceptAlert, amount/commission logic, fixtures, nickname → amount → message TTS and completion. Static repository music is authoritative. Web Audio is the music clock; GSAP authors seekable scenes; GPU capability must not determine cue timing. Complete donor messages must become readable. No gameplay capture, SaaS, priority interruption or runtime music analysis.

## Brand commitments

Full-screen cinematic motion, ascending importance, absurd HOLY MOLY / HALO energy, money rain and kinetic donor typography. The user delegates creative decisions explicitly in sections 21 and 40 of the supplied brief.

## Evidence and open decisions

Seven live configurations and seven music files exist. Donate8 is an orphaned SAY MY NAME component, without a configured threshold or audio asset. Do not invent a live eighth threshold. Studio can explore that identity with an explicitly shared existing track. Missing Donate10 references in baseline tests are stale, not evidence of a live tier.
