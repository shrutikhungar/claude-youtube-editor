import { Config } from '@remotion/cli/config';

// core/media IS Remotion's public root (see MIGRATION.md): staticFile('library/logos/x') →
// ../media/library/x (reusable), staticFile('projects/<proj>/x') → ../media/projects/... (per-video).
Config.setPublicDir('../media');

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // auto
Config.setDelayRenderTimeoutInMilliseconds(120000);

// Windows ARM64 native Chromium executable fallback
Config.setBrowserExecutable("C:\\Users\\shrut\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe");
