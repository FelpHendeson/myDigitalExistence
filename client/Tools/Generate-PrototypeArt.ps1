$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$art = Join-Path $PSScriptRoot '../Assets/Game/Art/Prototype'
[IO.Directory]::CreateDirectory($art) | Out-Null

function Paint([string]$hex) {
    if (!$palette.ContainsKey($hex)) {
        $palette[$hex] = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml("#$hex"))
    }
    $palette[$hex]
}
function Box([int]$x,[int]$y,[int]$w,[int]$h,[string]$hex) {
    $g.FillRectangle((Paint $hex), $x, $y, $w, $h)
}
function Poly([string]$hex,[int[]]$xy) {
    $points = [Drawing.Point[]]::new($xy.Length / 2)
    for ($i = 0; $i -lt $points.Length; $i++) {
        $points[$i] = [Drawing.Point]::new($xy[2 * $i], $xy[2 * $i + 1])
    }
    $g.FillPolygon((Paint $hex), $points)
}
function Save-Art([string]$id,[int]$width,[int]$height,[scriptblock]$draw) {
    $palette = @{}
    $bitmap = [Drawing.Bitmap]::new($width, $height, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [Drawing.Graphics]::FromImage($bitmap)
    try {
        & $draw
        $bitmap.Save((Join-Path $art "$id.png"), [Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $g.Dispose()
        $bitmap.Dispose()
        foreach ($brush in $palette.Values) { $brush.Dispose() }
    }
}
function Save-Part([string]$id,[scriptblock]$drawFrame) {
    Save-Art $id (96 * 7) 128 {
        # Four breathing frames followed by three reaction frames.
        $offsets = @(0, -1, -2, -1, -4, -7, -3)
        for ($frame = 0; $frame -lt $offsets.Length; $frame++) {
            $g.ResetTransform()
            $g.TranslateTransform(96 * $frame, 0)
            & $drawFrame $offsets[$frame] $frame
        }
    }
}

Save-Part 'body_balanced' {
    param($bob, $frame)
    $rise = [Math]::Min(0, $bob + 2)
    $g.TranslateTransform(0, $rise)
    Poly '221f2d' @(32,76,64,76,63,95,61,108,65,112,65,117,50,117,48,100,46,117,30,117,30,111,34,108,33,95)
    Poly '44465e' @(34,81,62,81,61,95,58,108,51,108,48,95,45,108,37,108,35,95)
    Poly '60617a' @(36,82,47,82,46,94,43,106,39,106,37,95)
    Box 33 112 11 3 '735457'
    Box 52 112 11 3 '654653'
    Box 31 115 14 1 'a07764'
    Box 51 115 13 1 '906358'
    $g.TranslateTransform(0, $bob - $rise)
    Poly '392a37' @(39,46,57,46,60,56,66,59,70,74,71,85,64,90,59,84,60,73,59,81,37,81,36,72,36,85,32,90,25,85,26,73,30,59,37,56)
    Poly 'be775e' @(32,62,38,61,34,73,34,83,31,87,27,84,28,74)
    Poly 'd8906b' @(63,61,67,68,69,84,65,87,61,84,62,72)
    Box 28 78 4 6 'e9a679'
    Box 65 79 3 5 'edaf83'
    Box 43 46 11 13 'ac6657'
    Poly '392a36' @(36,21,44,16,54,16,61,20,65,28,65,36,68,37,67,44,63,46,61,50,55,54,43,54,36,50,33,45,29,43,29,37,32,36,32,27)
    Poly 'c37a60' @(35,25,42,19,54,18,60,22,63,30,62,43,60,49,54,52,44,52,38,48,35,42)
    Poly 'e9a67e' @(37,27,43,22,53,21,58,24,60,30,60,43,55,48,44,49,39,45,36,39)
    Poly 'f2be91' @(37,30,43,25,53,25,55,28,42,31,39,38,37,38)
    Box 30 38 4 4 'c8826a'
    Box 63 38 3 4 'c8826a'
    Box 38 35 6 1 '734b4a'
    Box 53 35 6 1 '734b4a'
    if ($frame -eq 2 -or $frame -eq 5) {
        Box 39 40 5 1 '49333b'
        Box 53 40 5 1 '49333b'
    } else {
        Box 39 38 5 4 '40343d'
        Box 53 38 5 4 '40343d'
        Box 39 38 2 2 'f7dec0'
        Box 53 38 2 2 'f7dec0'
    }
    Box 47 43 3 2 'c78065'
    Box 38 44 4 1 'da8b73'
    Box 56 44 4 1 'da8b73'
    if ($frame -ge 4) {
        Box 45 47 7 1 '734348'
        Box 46 48 5 2 'a25055'
        Box 46 47 5 1 'fbd2ab'
    } else {
        Box 46 47 5 1 '9e605a'
    }
}

Save-Part 'hair_short_neat' {
    param($bob)
    $g.TranslateTransform(0, $bob)
    Poly '2b222e' @(31,23,35,17,43,13,53,13,62,18,65,24,66,34,63,39,61,32,58,28,52,30,52,27,44,31,40,30,35,35,33,39,31,34)
    Poly '55363d' @(33,23,39,17,47,15,55,16,61,20,63,25,62,29,58,25,48,29,51,24,42,28,36,32,33,32)
    Poly '825143' @(35,23,42,18,52,16,56,18,47,21,43,24,37,26)
    Box 36 22 5 2 '9c6450'
    Box 57 20 3 2 '694347'
}

Save-Part 'hair_wild_layers' {
    param($bob)
    $g.TranslateTransform(0, $bob)
    Poly '231f34' @(27,26,33,19,31,17,42,15,48,9,50,14,61,12,59,16,66,21,70,29,67,29,70,38,64,43,61,47,62,36,57,30,51,27,54,35,47,33,44,27,41,32,36,35,34,44,30,40,28,35,30,29)
    Poly '48415f' @(31,25,39,19,48,14,46,20,58,16,64,23,66,29,60,25,55,25,50,23,50,30,45,25,40,28,34,32,35,26)
    Poly '746484' @(35,23,47,16,44,21,38,24,34,27)
    Poly '6a5a79' @(49,21,58,18,62,22,56,21,52,24)
}

Save-Part 'torso_linen_tunic' {
    param($bob)
    $g.TranslateTransform(0, $bob)
    Poly '48343d' @(34,55,42,52,48,56,55,52,63,56,68,65,63,71,61,69,63,85,56,89,40,89,33,85,35,69,32,72,27,67)
    Poly 'c19777' @(34,58,42,54,48,59,55,54,63,58,66,65,63,68,59,64,61,83,55,87,41,87,35,84,38,64,32,69,30,66)
    Poly 'ebd2aa' @(35,58,41,56,48,61,54,56,60,57,61,61,57,64,58,81,54,84,40,84,38,81,40,63,33,67,32,65)
    Poly '896361' @(40,54,48,58,55,54,57,55,48,63,39,56)
    Box 36 73 24 5 '38766d'
    Box 38 73 20 2 '69a38a'
    Box 47 74 4 3 'dfba75'
    Box 38 83 18 2 'b0856d'
}

Save-Part 'torso_novice_robe' {
    param($bob)
    $g.TranslateTransform(0, $bob)
    Poly '252b3b' @(32,56,43,52,49,56,54,52,64,55,69,66,63,72,61,68,65,88,55,91,42,91,31,87,36,69,32,73,27,67)
    Poly '28636a' @(33,58,42,54,49,59,56,54,63,57,67,65,64,69,59,65,62,86,55,89,42,89,34,85,38,65,32,70,29,67)
    Poly '47908b' @(34,58,42,56,47,61,44,69,43,85,35,84,39,65,32,68,32,64)
    Poly '82b4a1' @(40,54,49,58,55,54,58,56,52,61,47,68,45,67,47,61,39,56)
    Box 36 74 24 4 '3a3b55'
    Box 37 74 22 1 '7e7287'
    Box 46 74 4 3 'e1b777'
    Box 44 80 2 8 '99bb9f'
}

Save-Part 'wpn_ashwood_practice_blade' {
    param($bob)
    $g.TranslateTransform(0, $bob)
    Poly '30252f' @(64,81,68,75,69,66,76,44,80,39,84,43,83,50,76,71,72,77,70,84)
    Poly '987051' @(72,69,78,46,81,42,82,45,81,50,74,70)
    Poly 'c19863' @(74,66,80,45,81,45,80,49,76,64)
    Poly '4c7d8c' @(67,69,78,73,77,76,66,73)
    Box 65 80 3 3 'be8b66'
}

Save-Part 'wpn_woven_staff' {
    param($bob)
    $g.TranslateTransform(0, $bob)
    Poly '31272f' @(64,105,68,72,73,44,70,37,72,30,78,26,85,27,90,32,89,40,83,45,80,43,74,77,69,107)
    Poly '9a674c' @(66,104,72,70,76,42,79,41,73,80,68,104)
    Poly 'c49764' @(71,37,74,31,78,28,84,29,88,33,86,39,82,42,76,41)
    Poly '332b35' @(75,35,78,32,83,32,85,35,83,38,79,40,76,38)
    Box 72 78 3 2 'c7a478'
    Box 70 84 3 2 'c7a478'
    Box 75 57 3 2 'c7a478'
}

Save-Art 'prototype_room' 192 336 {
    Box 0 0 192 336 '242536'
    Box 0 52 192 126 '393548'
    Box 0 53 192 3 '554050'
    Box 0 64 192 2 '43394b'
    Box 0 167 192 10 '5b4450'
    Box 0 171 192 2 '7b5859'
    Box 0 177 192 159 '4b3845'
    for ($row = 0; $row -lt 10; $row++) {
        $y = 179 + $row * 16
        Box 0 $y 192 14 (@('684751', '62424d', '704d54')[$row % 3])
        Box 0 $y 192 1 '80595b'
        for ($x = ($row % 2) * 18; $x -lt 192; $x += 36) {
            Box $x ($y + 1) 1 13 '4e3844'
            Box ($x + 5) ($y + 4) 13 1 '795458'
        }
    }
    # Window, dusk skyline and reflected light.
    Box 62 67 68 62 '252332'
    Box 65 65 62 60 '795759'
    Box 69 69 54 52 '253a56'
    Box 69 95 54 26 '4d5a70'
    Box 69 107 54 14 '68717e'
    Box 103 78 11 11 'e5c18b'
    Box 101 81 15 5 'e5c18b'
    Box 79 77 1 1 'b7a4a0'
    Box 87 86 2 1 'b7a4a0'
    Box 116 94 1 1 'b7a4a0'
    Poly '374661' @(69,113,77,103,85,108,96,99,110,112,122,105,123,121,69,121)
    Box 94 68 3 54 '72555a'
    Box 69 94 54 3 '72555a'
    Box 61 122 70 5 'ab7a68'
    Box 63 127 66 3 '51394a'
    Poly '71536a' @(67,126,125,126,158,213,40,213)
    Poly '7f5d71' @(74,128,117,128,141,201,56,201)
    # Rug and side furniture leave the middle clear.
    Poly '392d42' @(39,197,149,197,166,238,25,238)
    Poly '466267' @(41,198,147,198,160,232,31,232)
    Poly '617b76' @(45,202,143,202,151,227,38,227)
    Poly '4b696b' @(51,206,139,206,146,223,45,223)
    Box 42 227 106 2 '9c8a72'
    Box 14 129 34 48 '302935'
    Box 16 132 30 40 '805855'
    Box 18 134 26 11 'a47160'
    Box 18 148 26 10 '9a6659'
    Box 18 161 26 8 '8e5c55'
    Box 29 138 6 2 'e1b482'
    Box 29 152 6 2 'e1b482'
    Box 29 164 6 2 'd5a575'
    Box 12 128 38 4 'b4826a'
    Box 16 172 4 6 '362d39'
    Box 40 172 4 6 '362d39'
    Box 20 119 19 8 '3b5561'
    Box 22 116 17 3 '7a9a95'
    Box 23 118 17 1 'b9b19a'
    Box 150 164 20 15 '583e4b'
    Box 153 166 14 10 'a46c5c'
    Box 150 163 20 4 'c89070'
    Poly '2b484b' @(158,163,152,150,142,146,146,140,154,143,160,153,162,145,171,137,175,141,171,148,164,154,163,163)
    Poly '68927a' @(146,142,153,145,158,155,152,151,146,148)
    Poly '82a783' @(161,153,167,143,173,140,171,146,166,152)
    Box 157 156 5 7 '557968'
}

Save-Art 'contact_shadow' 46 12 {
    Poly '383040' @(6,3,15,1,31,1,40,3,45,6,40,9,31,11,15,11,5,9,0,6)
    Poly '453949' @(7,4,15,2,30,2,38,4,43,6,38,8,29,10,16,10,7,8,3,6)
}
