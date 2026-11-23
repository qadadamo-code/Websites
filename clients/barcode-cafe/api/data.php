<?php
/** Public JSON: menu, settings, moods and upcoming events (already priced and filtered). */
require dirname(__DIR__) . '/inc/core.php';
json_out(public_data());
