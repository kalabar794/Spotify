const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const SpotifyWebApi = require('spotify-web-api-node');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 9090;

// Initialize track data for mock mode - defining ALL track arrays globally
const happyTracks = [
  {
    spotifyId: '6NPVjNh8Jhru9xOmyQigds',
    name: 'Happy',
    artist: 'Pharrell Williams',
    album: 'G I R L',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b27356ff19308d0a5ad7db95b9a7',
    previewUrl: 'https://p.scdn.co/mp3-preview/6b00000be293e6b75e92829c5508908999d4d3c9'
  },
  {
    spotifyId: '2oF7FZHIJbzjeEXZ3D0Ku4',
    name: 'Dancing Queen',
    artist: 'ABBA',
    album: 'Arrival',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273f0895e29db88ed3505ea7239',
    previewUrl: 'https://p.scdn.co/mp3-preview/2ca6c49a7a3e1002f946c70ee8a94b3e56e26d9c'
  },
  {
    spotifyId: '2LEF1A8DOZ9wRYikWgVlZ8',
    name: 'Good Feeling',
    artist: 'Flo Rida',
    album: 'Wild Ones',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273a1c8e33600de3883754f5ce5',
    previewUrl: 'https://p.scdn.co/mp3-preview/4e7e155a798bd40d58f9e972dd2e1f6b2d6dd10a'
  },
  {
    spotifyId: '32OlwWuMpZ6b0aN2RZOeMS',
    name: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    album: 'Uptown Special',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e9993b9619d8bef685262a11',
    previewUrl: 'https://p.scdn.co/mp3-preview/d6a8932b79e4173252861b48078eb2c9524a5484'
  },
  {
    spotifyId: '1JCCdiru7fhstOIF4N7WJC',
    name: "Can't Stop the Feeling!",
    artist: 'Justin Timberlake',
    album: 'Trolls (Original Motion Picture Soundtrack)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273908280d9807127e185b71d37',
    previewUrl: 'https://p.scdn.co/mp3-preview/2cc23e1d4e6d9907c5ea1d8b54dba95203fd5369'
  },
  {
    spotifyId: '0cqRj7pUJDkTCEsJkx8snD',
    name: 'Shake It Off',
    artist: 'Taylor Swift',
    album: '1989',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2739abdf14e6058bd3903686148',
    previewUrl: 'https://p.scdn.co/mp3-preview/e6f75a3a049bc65c8532291fb65e0042a3f14ae7'
  },
  {
    spotifyId: '4W4fNrZYkobj539TOWsLO2',
    name: 'I Gotta Feeling',
    artist: 'Black Eyed Peas',
    album: 'THE E.N.D. (THE ENERGY NEVER DIES)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b27376b7b1664174a14d6287f4c9',
    previewUrl: 'https://p.scdn.co/mp3-preview/33f7e44a7c1b5bf527f84d25f9e754a94f89748a'
  },
  {
    spotifyId: '0ct6r3EGTcMLPtrXHDvVjc',
    name: 'The Middle',
    artist: 'Zedd, Maren Morris, Grey',
    album: 'The Middle',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273c03c5c4acb47ba3afcbaf8f9',
    previewUrl: 'https://p.scdn.co/mp3-preview/1a1dc596e00ce7e463b9a3f42bce9bb6ce10c87c'
  },
  {
    spotifyId: '6ebkx7Q3tIrTXCK2lMRmF9',
    name: 'Dynamite',
    artist: 'BTS',
    album: 'Dynamite (DayTime Version)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273344c3661f8a283e4bcf8a696',
    previewUrl: 'https://p.scdn.co/mp3-preview/7e5373f8a296c809192e2c8f5e297f70318aacc6'
  },
  {
    spotifyId: '0VjIjW4GlUZAMYd2vXMi3b',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    previewUrl: 'https://p.scdn.co/mp3-preview/c9a3a95714dd54f43737ed2aae670d25e4c98e11'
  }
];

const calmTracks = [
  {
    spotifyId: '4q3ewBCX7sLwd24euuV69X',
    name: 'Weightless',
    artist: 'Marconi Union',
    album: 'Ambient Transmissions Vol. 2',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2732f58f39e220f20e25792ae0a',
    previewUrl: 'https://p.scdn.co/mp3-preview/9cf2333257ef3231d37a9880c88d8b6127646ce0'
  },
  {
    spotifyId: '6V9fHiv84WlVTg7CSnIVY2',
    name: 'Clair de Lune',
    artist: 'Claude Debussy',
    album: 'Piano Masterpieces',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2739e4f3e637df6abe48b89ec11',
    previewUrl: 'https://p.scdn.co/mp3-preview/889c969fb064bd03912eb1cb7c744ad3c3f5a0f7'
  },
  {
    spotifyId: '1L66IBx7Th7eSneo5tgEAY',
    name: 'Breathe',
    artist: 'Télépopmusik',
    album: 'Genetic World',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273a4c62c41f4ef8bbdd52c4e88',
    previewUrl: 'https://p.scdn.co/mp3-preview/43e3a0d4107e2414e8e7fd78ff3c74c34e4b830f'
  },
  {
    spotifyId: '2bjwRfXMk4uRgOD9IBYl9h',
    name: 'River Flows In You',
    artist: 'Yiruma',
    album: 'Piano Recital: Yiruma',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273b7ca2c198f05561c651614d5',
    previewUrl: 'https://p.scdn.co/mp3-preview/fa6a88d72a66dabe2c564a20c532d0ab6d6a7be2'
  },
  {
    spotifyId: '1JLrQmodMSE0Oz2EgRTI6s',
    name: 'Ocean Eyes',
    artist: 'Billie Eilish',
    album: 'Ocean Eyes',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e9c6c2d416bce01ddc16c4b6',
    previewUrl: 'https://p.scdn.co/mp3-preview/5acb8d889ad93b67aa8cd7bef9a5dd94c6d5fa14'
  },
  {
    spotifyId: '4qnBDLSEXI6xJVRg9PaAWs',
    name: 'Gymnopédie No. 1',
    artist: 'Erik Satie',
    album: 'Gymnopédies',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2734cb46f3ab88a80e403ee68a7',
    previewUrl: 'https://p.scdn.co/mp3-preview/e3da66aa60641d14e375b63a9bd5a4f52e8dfb8a'
  },
  {
    spotifyId: '1BZG99C7Co1r6QUC3zaS59',
    name: 'Moonlight Sonata',
    artist: 'Ludwig van Beethoven',
    album: 'Classical Piano',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2734ad7b4bf6ff6ba86f83a3c77',
    previewUrl: 'https://p.scdn.co/mp3-preview/d1279e2f0af1a169cc0b42f78d4b937711e49eaf'
  },
  {
    spotifyId: '2etHQJxIbV0IiPWUMzY504',
    name: 'Ambient 1/Music For Airports: 2/1',
    artist: 'Brian Eno',
    album: 'Ambient 1: Music for Airports',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b27331f8cf3659aec140e1f54290',
    previewUrl: 'https://p.scdn.co/mp3-preview/2ddf8a6b63492d636bc42a27aaa1539c4c216464'
  },
  {
    spotifyId: '6oN9sInM1yUFZ9F93jn3VM',
    name: 'Arrival of the Birds',
    artist: 'The Cinematic Orchestra',
    album: 'The Crimson Wing: Mystery of the Flamingos',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273d17cc7876c0ff9bba28f0255',
    previewUrl: 'https://p.scdn.co/mp3-preview/a4f9b94f7734cc7008a6bbe3553d3673b9c3f75b'
  },
  {
    spotifyId: '0WSa1sucoNRcEeULlZVQXj',
    name: 'Lemon Tree',
    artist: 'Fools Garden',
    album: 'Dish of the Day',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b27367edf5d46edc6b99d04e9a38',
    previewUrl: 'https://p.scdn.co/mp3-preview/d4cf2923935adb539ac06dd6fdd79ce8b7eb06e6'
  }
];

const energeticTracks = [
  {
    spotifyId: '2KH16WveTQWT6KOG9Rg6e2',
    name: 'Eye of the Tiger',
    artist: 'Survivor',
    album: 'Eye of the Tiger',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2736c512aa71634f90b90533716',
    previewUrl: 'https://p.scdn.co/mp3-preview/c9c8be452088cf979dfa73486cd857d8ad7515be'
  },
  {
    spotifyId: '15DrNza0dgHRFbXl6cBrUP',
    name: 'Levels',
    artist: 'Avicii',
    album: 'Levels',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273be9d90eb16e5b8fc9badcf58',
    previewUrl: 'https://p.scdn.co/mp3-preview/22bd025764bbbe200e297f9fd7df00f2c4a4bf77'
  },
  {
    spotifyId: '77Ft1RJngppZlq59B6uP0z',
    name: 'Till I Collapse',
    artist: 'Eminem, Nate Dogg',
    album: 'The Eminem Show',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2736ca5c90113b30c3c43ffb8f4',
    previewUrl: 'https://p.scdn.co/mp3-preview/31d2036bc0e48980e3b8f866a9ec16eeadeb0abd'
  },
  {
    spotifyId: '7x9aauaA9cu6tyfpHnqDLo',
    name: 'Stronger',
    artist: 'Kanye West',
    album: 'Graduation',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273dfae7c2e8952b1e45f15db8a',
    previewUrl: 'https://p.scdn.co/mp3-preview/954e19b991fe639cb89fd18dac0b865ce06ca13d'
  },
  {
    spotifyId: '2gZUPNdnz5Y45eiGxpHGSc',
    name: 'Power',
    artist: 'Kanye West',
    album: 'My Beautiful Dark Twisted Fantasy',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273d9194aa18fa4c9362b47464f',
    previewUrl: 'https://p.scdn.co/mp3-preview/10a15e71e2a2b0ba5f6a28c11b9efb3ee89d51ae'
  },
  {
    spotifyId: '2SiXAy7TuUkycRVbbWDEpo',
    name: 'Thunderstruck',
    artist: 'AC/DC',
    album: 'The Razors Edge',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2732fbd77033247e889cb7d2ac4',
    previewUrl: 'https://p.scdn.co/mp3-preview/5c5ce005d0bc2c4eb09f56ee4b1be658e4588a97'
  },
  {
    spotifyId: '7hQJA50XrCWABAu5v6QZ4i',
    name: 'Don\'t Stop Me Now',
    artist: 'Queen',
    album: 'Jazz',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273f0be386befd8aa3677d83ffe',
    previewUrl: 'https://p.scdn.co/mp3-preview/d80e91a87f5f2073ab49e1ea6ef1f1cc54366d24'
  },
  {
    spotifyId: '3bidbhpOYeV4knp8AIu8Xn',
    name: 'Can\'t Hold Us',
    artist: 'Macklemore & Ryan Lewis feat. Ray Dalton',
    album: 'The Heist',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2732fd14135569545005e598c46',
    previewUrl: 'https://p.scdn.co/mp3-preview/e7ce37c7b60cbae6dff7c8f2c9e662fa9d8a3d3a'
  },
  {
    spotifyId: '2CAXCscbR8wbzUxZXTUUGX',
    name: 'Titanium',
    artist: 'David Guetta feat. Sia',
    album: 'Nothing but the Beat',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273807dea3b7e151be252dd01da',
    previewUrl: 'https://p.scdn.co/mp3-preview/13582934d8aac846e60da47f35d81af6a1a5ffa0'
  },
  {
    spotifyId: '7FIWs0pqAYbP91WWM0vlTQ',
    name: 'Lose Yourself',
    artist: 'Eminem',
    album: '8 Mile',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273fff0168aa6e49e2782a215e5',
    previewUrl: 'https://p.scdn.co/mp3-preview/1e4d895a4c803ccbdeac78ab72b58ea1a6c3147c'
  }
];

const sadTracks = [
  {
    spotifyId: '3ee8Jmje8o58CHK66QrVC2',
    name: 'Someone Like You',
    artist: 'Adele',
    album: '21',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273c4f52ef8c188d581d6968577',
    previewUrl: 'https://p.scdn.co/mp3-preview/d3c82e103eec7e0a00c899c8f8e33dcc72ae5cbf'
  },
  {
    spotifyId: '7qEHsqek33rTcFNT9PFqLf',
    name: 'Fix You',
    artist: 'Coldplay',
    album: 'X&Y',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2733d92b2ad5af9fbc8637425f0',
    previewUrl: 'https://p.scdn.co/mp3-preview/22ad10884a8b1e709736672a5ecb7c8f76584ee8'
  },
  {
    spotifyId: '0ENSn4fwAbCGeFGVUbXEU3',
    name: 'Hello',
    artist: 'Adele',
    album: '25',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273856b7a4f1c234a7ebe4f8775',
    previewUrl: 'https://p.scdn.co/mp3-preview/0b90429fd554bad6784f7a3254890bdbdd6a8dbe'
  },
  {
    spotifyId: '2GLMjDdZ7jH7G5r5Fz5Yfo',
    name: 'Say Something',
    artist: 'A Great Big World, Christina Aguilera',
    album: 'Is There Anybody Out There?',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2739abcb1f7c9f4269c5f86fe61',
    previewUrl: 'https://p.scdn.co/mp3-preview/8def4a0f9534cf14cf743ec48d234ca111483f1c'
  },
  {
    spotifyId: '6PJfFBxYAGBxo3OaTO0UQj',
    name: 'Skinny Love',
    artist: 'Birdy',
    album: 'Birdy (Deluxe Version)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e9c63b6e208db22c2a7aeff7',
    previewUrl: 'https://p.scdn.co/mp3-preview/c3de6e6bf1f9eb2d13a71a18840b7cb44542b81a'
  },
  {
    spotifyId: '57bgtoPSgt236HzfBOd8kj',
    name: 'Hurt',
    artist: 'Johnny Cash',
    album: 'American IV: The Man Comes Around',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273d5d73032b3e40220c2aa50f3',
    previewUrl: 'https://p.scdn.co/mp3-preview/84cfae87596a19f5e7e7c3f9e4494e0e1f0a6ad6'
  },
  {
    spotifyId: '3vkQ5DAB1qQMYO4Mr9zJN6',
    name: 'Tears in Heaven',
    artist: 'Eric Clapton',
    album: 'Unplugged',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e38a30277fcd883ec4fc61fc',
    previewUrl: 'https://p.scdn.co/mp3-preview/4da7485af5d36bfd75d4ad3d331d5f0e59d2ff85'
  },
  {
    spotifyId: '5ChkMS8OtdzJeqyybCc9R5',
    name: 'Wrecking Ball',
    artist: 'Miley Cyrus',
    album: 'Bangerz (Deluxe Version)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273249b35f5d2d5b54f81f04bf0',
    previewUrl: 'https://p.scdn.co/mp3-preview/55cfa38bb4a939d1f04f41fd204bcce55823f7e8'
  },
  {
    spotifyId: '1HNkqx9Ahdgi1Ixy2xkKkL',
    name: 'Photograph',
    artist: 'Ed Sheeran',
    album: 'x (Deluxe Edition)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b27326e080d91228d117413b1f9d',
    previewUrl: 'https://p.scdn.co/mp3-preview/097c0d06796d7b5b1d8d1a1782c1adb2a9ce504e'
  },
  {
    spotifyId: '5Ohxk2dO5COHF1krpoPigN',
    name: 'Sign of the Times',
    artist: 'Harry Styles',
    album: 'Harry Styles',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273d048152ef53707bf524afe5e',
    previewUrl: 'https://p.scdn.co/mp3-preview/af237206f561a976e18b3bee9d367121375cc10e'
  }
];

const romanticTracks = [
  {
    spotifyId: '0bYg9bo50gSsH3LtXe2SQn',
    name: 'All of Me',
    artist: 'John Legend',
    album: 'Love In The Future (Expanded Edition)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273743d5b41fae8df1fc86c1cef',
    previewUrl: 'https://p.scdn.co/mp3-preview/a1a6d80de72a0e3e4c4de4638be76e3be8b3fdcb'
  },
  {
    spotifyId: '0tgVpDi06FyKpA1z0VMD4v',
    name: 'Perfect',
    artist: 'Ed Sheeran',
    album: '÷ (Deluxe)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e9f86',
    previewUrl: 'https://p.scdn.co/mp3-preview/9779493d90a47f29e4257aa45bc6146d291f2eaf'
  },
  {
    spotifyId: '44AyOl4qVkzS48vBsbNXaC',
    name: "Can't Help Falling in Love",
    artist: 'Elvis Presley',
    album: 'Blue Hawaii',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273f908398a711e9a9c342085c9',
    previewUrl: 'https://p.scdn.co/mp3-preview/f504ceb0b10bf3d17f29d73f9ffb5fc16de93b6f'
  },
  {
    spotifyId: '48UPSzbZjgc449aqz8bxox',
    name: 'Thinking Out Loud',
    artist: 'Ed Sheeran',
    album: 'x (Deluxe Edition)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b27326e080d91228d117413b1f9d',
    previewUrl: 'https://p.scdn.co/mp3-preview/7fba47d0806142cb34ad2080a5f139eba915fe05'
  },
  {
    spotifyId: '0ZHZOdYCNn14cJ3ffZzA9w',
    name: 'Make You Feel My Love',
    artist: 'Adele',
    album: '19',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b27314b6672728e75f377ec6cf84',
    previewUrl: 'https://p.scdn.co/mp3-preview/13ee36b31fa70b45bee4d7cac9ee3a7d2a17ab8a'
  },
  {
    spotifyId: '2rfPHIbQiRMnW0cIMI8hWI',
    name: 'Love Me Like You Do',
    artist: 'Ellie Goulding',
    album: 'Fifty Shades of Grey (Original Motion Picture Soundtrack)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2734c1211f4f6e62307a8ea29e0',
    previewUrl: 'https://p.scdn.co/mp3-preview/9a1d4175f54c6167f1abd8ee44284e4efcbf80a5'
  },
  {
    spotifyId: '3a1lNhkSLSkpJE4MSHpDZh',
    name: 'Just the Way You Are',
    artist: 'Bruno Mars',
    album: 'Doo-Wops & Hooligans',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2739e1cfc756886ac782e363d79',
    previewUrl: 'https://p.scdn.co/mp3-preview/c99c9e1c36d7fa9d67bbf676ba5fddbabcbac31c'
  },
  {
    spotifyId: '2QZx8F9vQntkojBCtQabPJ',
    name: 'Lover',
    artist: 'Taylor Swift',
    album: 'Lover',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647',
    previewUrl: 'https://p.scdn.co/mp3-preview/6a52f7698d4bdb38ea7935c666ad8df61ded5631'
  },
  {
    spotifyId: '41zXlQxzTi6cGAjpOXyLYH',
    name: 'Say You Love Me',
    artist: 'Jessie Ware',
    album: 'Tough Love',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273b47ca1aadc2b0dcb2f33180c',
    previewUrl: 'https://p.scdn.co/mp3-preview/e50adb95b23d6e8c123cac8aca3a9e73a7b13f83'
  },
  {
    spotifyId: '0KKkJNfGyhkQ5aFogxQAPU',
    name: 'Iris',
    artist: 'The Goo Goo Dolls',
    album: 'Dizzy Up The Girl',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2737ddc139e70c8b28573558d3c',
    previewUrl: 'https://p.scdn.co/mp3-preview/57bea95d71d0c254532e9307d7c6823e70c78fec'
  }
];

const focusedTracks = [
  {
    spotifyId: '6GdJnV7YwJwFKfZ835eFxu',
    name: 'Experience',
    artist: 'Ludovico Einaudi',
    album: 'In A Time Lapse',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2733b27456537ae0290935d6c6b',
    previewUrl: 'https://p.scdn.co/mp3-preview/33ca7c4fe1f0f7b77bbb3d50981622c1fa3c68d7'
  },
  {
    spotifyId: '5TgU3cEKK9pcLiXBX3Zez5',
    name: 'Time',
    artist: 'Hans Zimmer',
    album: 'Inception (Music from the Motion Picture)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273f48385d1336b0c14cb7b57a3',
    previewUrl: 'https://p.scdn.co/mp3-preview/e0e53f5acf1dbf49dcf219378a4500a0f00e635a'
  },
  {
    spotifyId: '1uRxyAup7OYrlh2SHJb80N',
    name: 'Strobe',
    artist: 'Deadmau5',
    album: 'For Lack of a Better Name',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2735429247a77aa546477a4cc5f',
    previewUrl: 'https://p.scdn.co/mp3-preview/e3e1fe49e279c066ed15acdafef6e7517c33eea4'
  },
  {
    spotifyId: '6lAYjJQ8r9TM2Oj52gQqVf',
    name: 'Intro',
    artist: 'The xx',
    album: 'xx',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273fa12e77178b8c432da3d4191',
    previewUrl: 'https://p.scdn.co/mp3-preview/1ef5cdf2b847538c9d582039051c1f1fd6a83f20'
  },
  {
    spotifyId: '0bVtevEgtDIeRjCJbK3Lmv',
    name: 'Gymnopedie No. 1',
    artist: 'Erik Satie',
    album: 'Gymnopédies',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2734cb46f3ab88a80e403ee68a7',
    previewUrl: 'https://p.scdn.co/mp3-preview/e3da66aa60641d14e375b63a9bd5a4f52e8dfb8a'
  },
  {
    spotifyId: '33NXcOqrWK4eEFW9Q5FSlg',
    name: 'Nocturne No.2 in E Flat Major, Op.9, No.2',
    artist: 'Frédéric Chopin',
    album: 'Chopin: Nocturnes',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2737e95442fcf05eba3357579d8',
    previewUrl: 'https://p.scdn.co/mp3-preview/1bec5b8e85a1e49e18ea7a0ab17d6017a5df1f58'
  },
  {
    spotifyId: '2etHQJxIbV0IiPWUMzY504',
    name: 'Ambient 1/Music For Airports: 2/1',
    artist: 'Brian Eno',
    album: 'Ambient 1: Music for Airports',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b27331f8cf3659aec140e1f54290',
    previewUrl: 'https://p.scdn.co/mp3-preview/2ddf8a6b63492d636bc42a27aaa1539c4c216464'
  },
  {
    spotifyId: '6oN9sInM1yUFZ9F93jn3VM',
    name: 'Arrival of the Birds',
    artist: 'The Cinematic Orchestra',
    album: 'The Crimson Wing: Mystery of the Flamingos',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273d17cc7876c0ff9bba28f0255',
    previewUrl: 'https://p.scdn.co/mp3-preview/a4f9b94f7734cc7008a6bbe3553d3673b9c3f75b'
  },
  {
    spotifyId: '6KMWNq9njVoUGn5aCNqLbx',
    name: 'Treefingers',
    artist: 'Radiohead',
    album: 'Kid A',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273c3ad2a5d23ba1524f24ae735',
    previewUrl: 'https://p.scdn.co/mp3-preview/f58e8d72c0f47669773a51bcdfac255e15c0deb8'
  },
  {
    spotifyId: '3X3GbOalPe66xlajkOgWlE',
    name: 'Intro',
    artist: 'C418',
    album: 'Minecraft - Volume Alpha',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2737f5e8d0f86e3620372a5bfc8',
    previewUrl: 'https://p.scdn.co/mp3-preview/4a45c9d4f307bfa9b385108c097dcbcb933b017b'
  }
];

// Middleware
app.use(cors({
  origin: '*', // Allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global flag for database connection status
global.isDbConnected = false;

// Spotify token refresh mechanism
const refreshSpotifyToken = async () => {
  try {
    // Initialize Spotify API
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback'
    });
    
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('Spotify token refreshed, expires in', data.body['expires_in'], 'seconds');
    
    // Set timeout to refresh before expiration (subtract 60 seconds for safety)
    const refreshTime = (data.body['expires_in'] - 60) * 1000;
    setTimeout(refreshSpotifyToken, refreshTime);
    
    // Store the token globally
    global.spotifyToken = data.body['access_token'];
    global.spotifyTokenExpiration = Date.now() + (data.body['expires_in'] * 1000);
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    // Try again in 30 seconds if there was an error
    setTimeout(refreshSpotifyToken, 30 * 1000);
  }
};

// Fetch an initial token on server startup
refreshSpotifyToken();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moodmix', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
  .then(() => {
    console.log('MongoDB connected');
    global.isDbConnected = true;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Running with mock data mode');
    global.isDbConnected = false;
  });

// Routes
app.get('/', (req, res) => {
  res.send('MoodMix API is running' + (global.isDbConnected ? ' with MongoDB' : ' in mock data mode'));
});

// Simple test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Server is running correctly',
    timestamp: new Date().toISOString()
  });
});

// Database status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    server: 'running',
    database: global.isDbConnected ? 'connected' : 'disconnected',
    mode: global.isDbConnected ? 'production' : 'mock data',
    port: PORT
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const moodRoutes = require('./routes/mood');
const playlistRoutes = require('./routes/playlists');

// Use routes with error handling
app.use('/api/auth', (req, res, next) => {
  if (!global.isDbConnected && req.method !== 'GET') {
    return res.status(503).json({ error: 'Database is not available', mockMode: true });
  }
  next();
}, authRoutes);

app.use('/api/mood', moodRoutes);

app.use('/api/playlists', (req, res, next) => {
  if (!global.isDbConnected && req.method !== 'GET') {
    return res.status(503).json({ error: 'Database is not available', mockMode: true });
  }
  next();
}, playlistRoutes);

// Spotify API endpoint
app.post('/api/spotify/recommendations', async (req, res) => {
  try {
    const { moodKeywords, sentiment } = req.body;
    
    // Initialize Spotify API
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI
    });

    // Get access token
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    
    // Map mood to Spotify parameters
    const spotifyParams = mapMoodToSpotifyParams(moodKeywords, sentiment);
    
    // Get recommendations
    const recommendations = await spotifyApi.getRecommendations(spotifyParams);
    
    // Log an example track for debugging
    if (recommendations.body && recommendations.body.tracks && recommendations.body.tracks.length > 0) {
      console.log("Track data example:", JSON.stringify(recommendations.body.tracks[0], null, 2));
    }
    
    res.json(recommendations.body);
  } catch (error) {
    console.error('Error getting Spotify recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Endpoint to analyze mood and get Spotify track recommendations
app.post('/api/analyze-mood', async (req, res) => {
  try {
    console.log('Received request for mood analysis:', req.body);
    
    // Extract text from request body
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    // Extract mood keywords from text
    const moodKeywords = extractMoodKeywords(text);
    console.log('Extracted mood keywords:', moodKeywords, 'from text:', text);
    
    // Basic sentiment analysis
    const sentiment = analyzeSentiment(text);
    
    // Create mood object
    const mood = {
      keywords: moodKeywords,
      sentiment,
      originalText: text
    };
    
    console.log('Analyzed mood:', mood);
    
    // Get tracks from Spotify API instead of mock data
    let tracks = [];
    
    try {
      // Initialize Spotify API
      const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID || 'YOUR_SPOTIFY_CLIENT_ID', // Update this with your actual client ID
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || 'YOUR_SPOTIFY_CLIENT_SECRET', // Update this with your actual client secret
        redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback'
      });

      // Get access token
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body['access_token']);
      
      // Map mood to Spotify parameters
      const spotifyParams = mapMoodToSpotifyParams(moodKeywords, sentiment);
      
      // Get recommendations from Spotify
      const recommendations = await spotifyApi.getRecommendations(spotifyParams);
      
      if (recommendations.body && recommendations.body.tracks) {
        // Log an example track for debugging
        if (recommendations.body.tracks.length > 0) {
          console.log("Track data example in analyze-mood:", JSON.stringify(recommendations.body.tracks[0], null, 2));
        }
        
        // Map Spotify tracks to our format
        tracks = recommendations.body.tracks.map(track => ({
          spotifyId: track.id,
          name: track.name,
          artist: track.artists.map(artist => artist.name).join(', '),
          album: track.album.name,
          albumArt: track.album.images[0]?.url,
          previewUrl: track.preview_url
        })).filter(track => track.previewUrl); // Only include tracks with preview URLs
        
        // Limit to 8 tracks with preview URLs
        if (tracks.length < 8) {
          // If we don't have enough tracks with preview URLs, fall back to mock data
          const mockTracks = generateMockTracks(moodKeywords, sentiment);
          // Add enough mock tracks to reach 8 tracks total
          tracks = [...tracks, ...mockTracks.slice(0, 8 - tracks.length)];
        } else {
          tracks = tracks.slice(0, 8);
        }
      }
      
      // If no tracks from Spotify, use mock data as fallback
      if (!tracks || tracks.length === 0) {
        console.log('No tracks from Spotify, using mock data as fallback');
        tracks = generateMockTracks(moodKeywords, sentiment);
      }
    } catch (spotifyError) {
      console.error('Error getting tracks from Spotify:', spotifyError);
      // Fall back to mock data if Spotify API fails
      tracks = generateMockTracks(moodKeywords, sentiment);
    }
    
    // Return mood and tracks in one response
    return res.json({
      mood,
      tracks
    });
    
  } catch (error) {
    console.error('Error in analyze-mood endpoint:', error);
    // Even on error, return some tracks from mock data
    const tracks = happyTracks.slice(0, 8);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      tracks 
    });
  }
});

// Function to generate mock tracks based on mood
function generateMockTracks(moodKeywords, sentiment) {
  console.log('Generating mock tracks for:', moodKeywords, sentiment);
  
  try {
    // Safety check for empty or invalid input
    if (!Array.isArray(moodKeywords) || moodKeywords.length === 0) {
      console.log('Invalid mood keywords, returning mixed tracks');
      return getMixedTracks();
    }
    
    // Convert all keywords to lowercase for consistent matching
    const lowerCaseKeywords = moodKeywords.map(keyword => keyword.toLowerCase().trim());
    
    // Check for specific mood keywords and return 8 tracks per category
    if (lowerCaseKeywords.some(keyword => ['happy', 'excited', 'joyful', 'cheerful', 'glad'].includes(keyword))) {
      console.log('Returning happy tracks');
      return happyTracks.slice(0, 8);
    }
    
    if (lowerCaseKeywords.some(keyword => ['calm', 'peaceful', 'relaxed', 'chill', 'quiet'].includes(keyword))) {
      console.log('Returning calm tracks');
      return calmTracks.slice(0, 8);
    }
    
    if (lowerCaseKeywords.some(keyword => ['energetic', 'energic', 'motivated', 'pumped', 'energy', 'active'].includes(keyword))) {
      console.log('Returning energetic tracks');
      return energeticTracks.slice(0, 8);
    }
    
    if (lowerCaseKeywords.some(keyword => ['sad', 'depressed', 'melancholy', 'gloomy', 'unhappy'].includes(keyword))) {
      console.log('Returning sad tracks');
      return sadTracks.slice(0, 8);
    }
    
    if (lowerCaseKeywords.some(keyword => ['romantic', 'love', 'passionate', 'loving'].includes(keyword))) {
      console.log('Returning romantic tracks');
      return romanticTracks.slice(0, 8);
    }
    
    if (lowerCaseKeywords.some(keyword => ['focused', 'concentrate', 'productive', 'study', 'concentration'].includes(keyword))) {
      console.log('Returning focused tracks');
      return focusedTracks.slice(0, 8);
    }
    
    // If no specific mood matched, check sentiment score
    if (sentiment !== undefined) {
      if (sentiment > 0.6) {
        console.log('Returning happy tracks based on positive sentiment');
        return happyTracks.slice(0, 8);
      } else if (sentiment < 0) {
        console.log('Returning sad tracks based on negative sentiment');
        return sadTracks.slice(0, 8);
      } else {
        console.log('Returning calm tracks based on neutral sentiment');
        return calmTracks.slice(0, 8);
      }
    }
    
    // Fallback to a mix of tracks if no specific mood or sentiment was matched
    console.log('No specific mood matched, returning a mix of tracks');
    return getMixedTracks();
  } catch (error) {
    console.error('Error in generateMockTracks:', error);
    // Return a safe fallback in case of any errors
    return getMixedTracks();
  }
}

// Helper function to create a balanced mix of tracks from different categories
function getMixedTracks() {
  return [
    ...happyTracks.slice(0, 2),      // 2 happy tracks
    ...energeticTracks.slice(0, 2),  // 2 energetic tracks
    ...calmTracks.slice(0, 2),       // 2 calm tracks
    ...romanticTracks.slice(0, 1),   // 1 romantic track
    ...focusedTracks.slice(0, 1)     // 1 focused track
  ];
}

// Helper function to map mood to Spotify parameters
function mapMoodToSpotifyParams(moodKeywords, sentiment) {
  let params = {
    limit: 10,
    market: 'US'
  };
  
  // Ensure moodKeywords is an array
  if (!Array.isArray(moodKeywords)) {
    moodKeywords = [];
  }
  
  // Available Spotify seed types
  // We can use a combination of artists, tracks, and genres (max 5 total)
  // Prioritize genres for mood-based recommendations
  
  // Popular genre seeds that work well with Spotify
  const popularGenres = [
    'pop', 'rock', 'hip-hop', 'rap', 'electronic', 'dance', 'r-n-b', 'indie', 
    'alternative', 'classical', 'jazz', 'ambient', 'folk', 'blues', 'metal'
  ];
  
  // Mood-specific genre maps
  const genreMaps = {
    happy: ['pop', 'dance', 'disco', 'happy', 'party', 'funk', 'power-pop'],
    sad: ['sad', 'piano', 'indie', 'soul', 'blues', 'acoustic', 'rainy-day'],
    energetic: ['dance', 'edm', 'electronic', 'house', 'dubstep', 'hip-hop', 'workout'],
    calm: ['ambient', 'chill', 'classical', 'acoustic', 'sleep', 'piano', 'study'],
    angry: ['metal', 'rock', 'punk', 'hardcore', 'grunge', 'alt-rock'],
    focused: ['focus', 'ambient', 'study', 'piano', 'classical', 'electronic', 'instrumental'],
    romantic: ['romance', 'r-n-b', 'soul', 'jazz', 'pop', 'indie']
  };
  
  // Default parameters based on sentiment
  if (sentiment > 0.6) {
    // Very positive sentiment
    params.min_valence = 0.7;
    params.min_energy = 0.6;
    params.seed_genres = genreMaps.happy.slice(0, 2);
  } 
  else if (sentiment > 0.2) {
    // Moderately positive sentiment
    params.min_valence = 0.5;
    params.target_energy = 0.6;
    params.seed_genres = [genreMaps.happy[0], genreMaps.energetic[0]];
  }
  else if (sentiment < -0.5) {
    // Very negative sentiment
    params.max_valence = 0.3;
    params.max_energy = 0.4;
    params.seed_genres = genreMaps.sad.slice(0, 2);
  }
  else if (sentiment < 0) {
    // Moderately negative sentiment
    params.max_valence = 0.4;
    params.target_energy = 0.4;
    params.seed_genres = [genreMaps.sad[0], genreMaps.calm[0]];
  }
  else {
    // Neutral sentiment
    params.target_valence = 0.5;
    params.target_energy = 0.5;
    params.seed_genres = ['pop', 'rock'];
  }
  
  // Analyze specific mood keywords
  if (moodKeywords.length > 0) {
    // Reset seed_genres for more accurate keyword-based recommendations
    params.seed_genres = [];
    
    let moodType = '';
    
    // Determine primary mood type
    for (const keyword of moodKeywords) {
      const word = keyword.toLowerCase();
      
      if (['happy', 'joy', 'excited', 'cheerful', 'good', 'great', 'positive'].includes(word)) {
        moodType = 'happy';
        break;
      }
      else if (['sad', 'depressed', 'gloomy', 'melancholy', 'down', 'unhappy'].includes(word)) {
        moodType = 'sad';
        break;
      }
      else if (['energetic', 'active', 'energized', 'pumped', 'motivated', 'energy'].includes(word)) {
        moodType = 'energetic';
        break;
      }
      else if (['calm', 'peaceful', 'relaxed', 'chill', 'tranquil', 'mellow'].includes(word)) {
        moodType = 'calm';
        break;
      }
      else if (['angry', 'frustrated', 'mad', 'furious', 'irritated'].includes(word)) {
        moodType = 'angry';
        break;
      }
      else if (['focused', 'productive', 'concentration', 'study', 'work'].includes(word)) {
        moodType = 'focused';
        break;
      }
      else if (['romantic', 'love', 'passion', 'intimate', 'loving'].includes(word)) {
        moodType = 'romantic';
        break;
      }
    }
    
    // Set parameters based on identified mood type
    switch(moodType) {
      case 'happy':
        params.min_valence = 0.7;
        params.min_energy = 0.6;
        params.seed_genres = genreMaps.happy.slice(0, 3);
        break;
      case 'sad':
        params.max_valence = 0.3;
        params.max_energy = 0.4;
        params.target_acousticness = 0.7;
        params.seed_genres = genreMaps.sad.slice(0, 3);
        break;
      case 'energetic':
        params.min_energy = 0.8;
        params.min_danceability = 0.6;
        params.seed_genres = genreMaps.energetic.slice(0, 3);
        break;
      case 'calm':
        params.max_energy = 0.4;
        params.min_instrumentalness = 0.3;
        params.target_acousticness = 0.6;
        params.seed_genres = genreMaps.calm.slice(0, 3);
        break;
      case 'angry':
        params.min_energy = 0.7;
        params.max_valence = 0.4;
        params.seed_genres = genreMaps.angry.slice(0, 3);
        break;
      case 'focused':
        params.target_energy = 0.5;
        params.min_instrumentalness = 0.3;
        params.max_speechiness = 0.1;
        params.seed_genres = genreMaps.focused.slice(0, 3);
        break;
      case 'romantic':
        params.target_valence = 0.6;
        params.target_energy = 0.4;
        params.target_acousticness = 0.4;
        params.seed_genres = genreMaps.romantic.slice(0, 3);
        break;
      default:
        // If no specific mood identified, use sentiment-based defaults
        // But make sure we have some seed genres
        if (params.seed_genres.length === 0) {
          params.seed_genres = popularGenres.slice(0, 3);
        }
    }
  }
  
  // Limit to no more than 5 seed items total (Spotify limit)
  // Prioritize genres for mood-based recommendations
  if (params.seed_genres && params.seed_genres.length > 5) {
    params.seed_genres = params.seed_genres.slice(0, 5);
  }
  
  // Make sure we have at least one seed genre
  if (!params.seed_genres || params.seed_genres.length === 0) {
    params.seed_genres = ['pop'];
  }
  
  // Clean up null/undefined values
  Object.keys(params).forEach(key => {
    if (params[key] === undefined || params[key] === null) {
      delete params[key];
    }
  });
  
  return params;
}

// Fix: make sure isMockMode function is defined before exporting it
function isMockMode() {
  // Always use Spotify API instead of mock data
  return false;
}

// Add the proxy endpoint for Spotify previews
app.get('/api/preview-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Preview URL is required' });
    }
    
    // Fetch the audio file and pipe it to the response
    const response = await fetch(url);
    
    // Set appropriate headers
    res.set('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    res.set('Accept-Ranges', 'bytes');
    
    // Pipe the response body to our response
    response.body.pipe(res);
  } catch (error) {
    console.error('Preview proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy preview URL' });
  }
});

// General CORS proxy for any URL
app.get('/api/cors-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    console.log('Proxying request to:', url);
    
    // Make request to Spotify
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`Proxy error: ${response.status} ${response.statusText}`);
      return res.status(response.status).send('Proxy error');
    }
    
    // Set content type header based on response
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.set('Content-Type', contentType);
    }
    
    // Stream the response data
    response.body.pipe(res);
  } catch (error) {
    console.error('Proxy server error:', error);
    res.status(500).send('Proxy server error');
  }
});

// For Vercel serverless function compatibility
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. You may have another instance of the server running.`);
      console.error('Try using a different port with: PORT=<new_port> npm run dev');
      process.exit(1);
    } else {
      console.error('Error starting server:', error);
    }
  });
}

// Export the Express API for Vercel
module.exports = app;

// Export functions for use in other modules
module.exports = {
  generateMockTracks,
  isMockMode
}; 