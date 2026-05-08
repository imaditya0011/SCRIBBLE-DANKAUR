const express = require('express');
const path = require('path');
const Socket = require('socket.io');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

var playerIndex = 0;
var hasGameStarted = false;
var wordToDraw = null;
const FIXED_ROOM = 'friends-permanent-lobby';
var cancelChooseWordTimer;
var chooseWordTime = 20; // in seconds
var drawTime = 80; // in seconds
var wordOptions = [];
var chosenPlayer;
var guessersList = [];
var scoreBoard = [];
var cancelDrawTimer = null;
var chatAdminPWD = "admin";
var currentPenColor = '#000000';
var drawHistory = [];
var roundToken = 0;


app.use(express.static('public'));


function random_word_gen() {
    wordlist = ['Pac-Man', 'bow', 'Apple', 'chest', 'six pack', 'nail', 'tornado', 'Mickey Mouse', 'Youtube', 'lightning', 'traffic light', 'waterfall', 'McDonalds', 'Donald Trump', 'Patrick', 'stop sign', 'Superman', 'tooth', 'sunflower', 'keyboard', 'island', 'Pikachu', 'Harry Potter', 'Bikini', 'Facebook', 'eyebrow', 'Kiss', 'Shit', 'Creep', 'octopus', 'church', 'Eiffel tower', 'tongue', 'snowflake', 'fish', 'Twitter', 'pan', 'Jesus Christ', 'butt', 'jail', 'Pepsi', 'hospital', 'pregnant', 'thunderstorm', 'smile', 'skull', 'flower', 'palm tree', 'Angry Birds', 'America', 'lips', 'cloud', 'compass', 'mustache', 'Captain America', 'pimple', 'spider Web', 'chicken', 'Elmo', 'watch', 'prison', 'skeleton', 'arrow', 'volcano', 'Minion', 'school', 'tie', 'lighthouse', 'fountain', 'Cookie', 'Iron Man', 'Santa', 'blood', 'river', 'bar', 'Mount Everest', 'chest hair', 'Bubble Gum', 'north', 'water', 'cactus', 'treehouse', 'bridge', 'short', 'thumb', 'Middle Finger', 'beach', 'mountain', 'Nike', 'flag', 'Paris', 'eyelash', 'Doraemon', 'brain', 'iceberg', 'fingernail', 'playground', 'ice cream', 'Google', 'dead', 'knife', 'spoon', 'unicorn', 'Spiderman', 'black', 'graveyard', 'elbow', 'golden egg', 'yellow', 'Germany', 'Adidas', 'nose hair', 'Deadpool', 'Simpson', 'mr bean', 'rainbow', 'ruler', 'building', 'raindrop', 'storm', 'coffee shop', 'windmill', 'fidget spinner', 'yo-yo', 'ice', 'legs', 'tent', 'mouth', 'ocean', 'Fanta', 'homeless', 'tablet', 'muscle', 'Pinocchio', 'tear', 'nose', 'snow', 'nostrils', 'dick', 'navel', 'Lion King', 'car wash', 'Egypt', 'Statue of Liberty', 'Kitty', 'pinky', 'fart', 'guitar', 'Hulk', 'Bra Strap', 'Nutella', 'cold', 'flag', 'Canada', 'rainforest', 'blue', 'rose', 'tree', 'hot', 'mailbox', 'Robot', 'crab', 'knee', 'dog', 'Chrome', 'cotton candy', 'Barack Obama', 'hot chocolate', 'Michael Jackson', 'map', 'Samsung', 'shoulder', 'Microsoft', 'parking', 'forest', 'full moon', 'cherry blossom', 'apple company', 'map', 'leaf', 'bat', 'earwax', 'Italy', 'finger', 'seed', 'lilypad', 'brush', 'record', 'wrist', 'thunder', 'gummy', 'flu', 'fire hydrant', 'overweight', 'hot dog', 'house', 'fork', 'pink', 'Sonic', 'street', 'Nasa', 'arm', 'fast', 'tunnel', 'full', 'library', 'pet shop', 'lid', 'Russia', 'drum kit', 'Android', 'hook', 'price tag', 'Tooth Fairy', 'bus stop', 'rain', 'heart', 'face', 'tower', 'bank', 'cheeks', 'Batman', 'speaker', 'Thor', 'skinny', 'electric guitar', 'belly', 'cute', 'ice cream truck', 'bubble gum', 'hat', 'Pink Panther', 'hand', 'bald', 'french fries', 'clever', 'armpit', 'Japan', 'thin', 'traffic', 'spaghetti', 'Pokemon', 'broken heart', 'fingertip', 'funny', 'poisonous', 'Wonder Woman', 'Squid game', 'Mark Zuckerberg', 'twins', 'red', 'China', 'dream', 'Dora', 'daisy', 'France', 'Discord', 'toenail', 'positive', 'forehead', 'earthquake', 'iron', 'Zeus', 'Mercedes', 'Big Ben', 'supermarket', 'underwear', 'condom', 'drink', 'rock', 'drum', 'piano', 'white', 'bench', 'fall', 'royal', 'seashell', 'Audi', 'stomach', 'aquarium', 'Bitcoin', 'volleyball', 'marshmallow', 'Cat', 'underground', 'Lantern', 'bottle flip', 'toothbrush', 'globe', 'sand', 'zoo', 'west', 'puddle', 'lobster', 'North Korea', 'sperm', 'bamboo', 'Great Wall', 'Kim Jong', 'bad', 'credit card', 'swimming pool', 'Wolverine', 'head', 'hair', 'Yoga', 'fuck', 'turkey', 'heel', 'chicken', 'clean', 'droplet', 'cinema', 'poor', 'stamp', 'Africa', 'whistle', 'hairy', 'wind', 'Aladdin', 'tissue box', 'fire truck', 'Usain Bolt', 'water gun', 'farm', 'iPad', 'well', 'warm', 'blogger', 'WhatsApp', 'Skype', 'landscape', 'pine tree', 'Mexico', 'slow', 'organ', 'fish bowl', 'teddy bear', 'John Cena', 'moan', 'tennis racket', 'gummy bear', 'Mount Everest', 'swing', 'Mario', 'lake', 'point', 'vein', 'cave', 'smell', 'chin', 'desert', 'scary', 'Family man', 'airport', 'kiwi', 'weed', 'incognito', 'Pluto', 'statue', 'hairy', 'strawberry', 'low', 'invisible', 'blindfold', 'tuna fish', 'controller', 'Paypal', 'King Kong', 'neck', 'lung', 'weather', 'Xbox', 'tiny', 'santa', 'flashlight', 'scissors', 'emoji', 'strong', 'saliva', 'firefighter', 'fevikwik', 'basketball', 'spring', 'Tarzan', 'red carpet', 'drain', 'shimla', 'nose ring', 'caterpillar', 'stranger things', 'belt', 'polar bear', 'Scooby Doo', 'wave', 'sea', 'grass', 'pancake', 'park', 'lipstick', 'harsh bhati', 'east', 'grenade', 'village', 'Flash', 'throat', 'dizzy', 'Asia', 'petal', 'Guru', 'country', 'spaceship', 'restaurant', 'copy', 'skin', 'glue stick', 'Andrew Garfield', 'equation', 'blizzard', 'golden apple', 'Robin Hood', 'fast food', 'wire', 'Bill Gates', 'Tower', 'neighborhood', 'Saviour', 'video game', 'high heels', 'dirty', 'flamethrower', 'pencil sharpener', 'hill', 'old', 'flute', 'cheek', 'violin', 'fireball', 'spine', 'bathtub', 'cell phone', 'breath', 'open', 'Australia', 'toothpaste', 'Tails', 'skyscraper', 'cowbell', 'rib', 'ceiling fan', 'Eminem', 'puke', 'photo frame', 'burn', 'sandstorm', 'Jackie Chan', 'Abraham Lincoln', 'Time', 'pot', 'KFC', 'shell', 'poison', 'acne', 'avocado', 'study', 'loser', 'England', 'clown', 'scar', 'Skirt', 'Pikachu', 'branch', 'Dumbo', 'factory', 'Hollywood', 'deep', 'knuckle', 'popular', 'piggy bank', 'Las Vegas', 'microphone', 'Tower Bridge', 'butterfly', 'slide', 'hut', 'shovel', 'hamburger', 'shop', 'fort', 'Ikea', 'planet', 'border', 'panda', 'highway', 'swamp', 'tropical', 'lightbulb', 'colonel', 'headphones', 'jungle', 'Reddit', 'young', 'trumpet', 'cheeseburger', 'gas mask', 'apartment', 'asshole', 'nutcracker', 'Antarctica', 'mansion', 'bunk bed', 'sunglasses', 'spray paint', 'bomb', 'saltwater', 'tank', 'cliff', 'campfire', 'palm', 'pumpkin', 'elephant', 'hello', 'nature', 'alley', 'fireproof', 'earbuds', 'crossbow', 'Elon Musk', 'cigarette', 'Playstation', 'Hawaii', 'good', 'corn', 'Gandalf', 'dock', 'magic wand', 'field', 'Solar System', 'photograph', 'ukulele', 'James Bond', 'The Beatles', 'Kettle', 'pirates', 'Poison', 'Netherlands', 'photographer', 'Lego', 'hourglass', 'glass', 'path', 'hotel', 'ramp', 'dandelion', 'Brazil', 'coral', 'chemical', 'messy', 'Dexter', 'valley', 'parachute', 'wine glass', 'matchbox', 'Morgan', 'black hole', 'midnight', 'astronaut', 'paper bag', 'sand castle', 'forest fire', 'hot sauce', 'social media', 'William Shakespeare', 'trash can', 'fire alarm', 'rainbow', 'nail polish', 'Band Aid', 'Star Wars', 'clothes hanger', 'toe', 'mud', 'coconut', 'jaw', 'bomb', 'south', 'firework', 'sailboat', 'loading', 'iPhone', 'toothpick', 'BMW', 'ketchup', 'fossil', 'explosion', 'Fins', 'Einstein', 'infinite', 'dictionary', 'Photoshop', 'glory', 'cabinet', 'rubber', 'saxophone', 'helicopter', 'temperature', 'bus driver', 'cello', 'London', 'newspaper', 'blackberry', 'shopping cart', 'pakistan', 'Daffy Duck', 'mayonnaise', 'explosion', 'flying pan', 'underweight', 'bandage', 'bungee jumping', 'kindergarten', 'umbrella', 'hammer', 'night', 'laser', 'glove', 'square', 'controller', 'firehouse', 'dynamite', 'chainsaw', 'melon', 'waist', 'Chew', 'kidney', 'stoned', 'Rick', 'ticket', 'skateboard', 'microwave', 'television', 'soil', 'exam', 'cocktail', 'India', 'man', 'missile', 'hilarious', 'Popeye', 'nuke', 'silicon', 'chemical', 'museum', 'Vault boy', 'adorable', 'fast forward', 'firecracker', 'grandmother', 'Pig', 'roadblock', 'continent', 'wrinkle', 'shaving cream', 'Northern Lights', 'tug', 'London Eye', 'Israel', 'shipwreck', 'xylophone', 'motorcycle', 'diamond', 'root', 'coffee', 'princess', 'Oreo', 'goldfish', 'wizard', 'chocolate', 'garbage', 'ladybug', 'shotgun', 'kangaroo', 'Minecraft', 'video', 'message', 'lily', 'fisherman', 'cucumber', 'password', 'western', 'ambulance', 'doorknob', 'middlefinger', 'makeup', 'barbecue', 'jazz', 'hedgehog', 'bark', 'tombstone', 'coast', 'pitchfork', 'Christmas', 'opera', 'office', 'insect', 'hunger', 'download', 'hairbrush', 'blueberry', 'cookie jar', 'canyon', 'Happy Meal', 'high five', 'monkey', 'quarter', 'penis', 'imagination', 'microscope', 'table tennis', 'whisper', 'flies', 'pencil case', 'harmonium', 'Family', 'New Zealand', 'apple pie', 'warehouse', 'cookie', 'USB', 'jellyfish', 'bubble', 'battery', 'fireman', 'pizza', 'angry', 'taco', 'harp', 'alcohol', 'pound', 'bedtime', 'megaphone', 'husband', 'oval', 'rail', 'stab', 'dwarf', 'milkshake', 'witch', 'bakery', 'president', 'weak', 'second', 'sushi', 'mall', 'complete', 'hip hop', 'slippery', 'horizon', 'prawn', 'plumber', 'blowfish', 'Madagascar', 'Europe', 'bazooka', 'pogo', 'Terminator', 'Hercules', 'notification', 'snowball fight', 'high score', 'Kung Fu', 'Lady Gaga', 'geography', 'hammer', 'bear', 'sky', 'cheese', 'vine', 'clown', 'catfish', 'snowman', 'bowl', 'waffle', 'vegetable', 'hook', 'shadow', 'dinosaur', 'lane', 'dance', 'scarf', 'cabin', 'Tweety', 'bookshelf', 'swordfish', 'skyline', 'base', 'straw', 'biscuit', 'Greece', 'bleach', 'pepper', 'reflection', 'universe', 'skateboarder', 'triplets', 'gold chain', 'electric car', 'policeman', 'electricity', 'mother', 'Bambi', 'croissant', 'Ireland', 'sandbox', 'stadium', 'depressed', 'Jhony sins', 'silverware', 'raspberry', 'dandruff', 'Scotland', 'comic book', 'cylinder', 'Milky Way', 'taxi driver', 'magic trick', 'sunrise', 'popcorn', 'eat', 'cola', 'cake', 'pond', 'mushroom', 'rocket', 'surfboard', 'baby', 'cape', 'glasses', 'sunburn', 'chef', 'gate', 'charger', 'crack', 'love', 'triangle', 'carpet', 'dessert', 'taser', 'afro', 'cobra', 'ringtone', 'cockroach', 'levitate', 'mailman', 'rockstar', 'lyrics', 'grumpy', 'stand', 'Norway', 'binoculars', 'nightclub', 'puppet', 'novel', 'injection', 'thief', 'pray', 'chandelier', 'exercise', 'lava', 'lap', 'massage', 'thermometer', 'golf cart', 'postcard', 'bell pepper', 'bed bug', 'paintball', 'Notch', 'yogurt', 'graph', 'seafood', 'Opera House', 'Sushi', 'parents', 'bed sheet', 'Leonardo da Vinci', 'intersection', 'palace', 'shrub', 'lumberjack', 'relationship', 'observatory', 'junk food', 'eye', 'log', 'dice', 'bicycle', 'pineapple', 'camera', 'circle', 'lemonade', 'soda', 'comb', 'cube', 'Doritos', 'love', 'table', 'honey', 'lighter', 'broccoli', 'fireplace', 'drive', 'Titanic', 'backpack', 'emerald', 'giraffe', 'world', 'internet', 'kitten', 'volume', 'Spain', 'daughter', 'armor', 'noob', 'rectangle', 'driver', 'raccoon', 'bacon', 'lady', 'bull', 'camping', 'poppy', 'snowball', 'farmer', 'lasso', 'breakfast', 'oxygen', 'milkman', 'caveman', 'laboratory', 'bandage', 'neighbor', 'Cupid', 'Sudoku', 'wedding', 'seagull', 'spatula', 'atom', 'dew', 'fortress', 'vegetarian', 'ivy', 'snowboard', 'conversation', 'treasure', 'chopsticks', 'garlic', 'vacuum', 'swimsuit', 'divorce', 'advertisement', 'vuvuzela', 'Mr Bean', 'Fred Flintstone', 'pet food', 'upgrade', 'voodoo', 'punishment', 'Charlie Chaplin', 'Rome', 'graduation', 'beatbox', 'communism', 'yeti', 'ear', 'dots', 'octagon', 'kite', 'lion', 'winner', 'muffin', 'cupcake', 'unicorn', 'smoke', 'lime', 'monster', 'Mars', 'moss', 'summer', 'lollipop', 'coffin', 'paint', 'lottery', 'wife', 'pirate', 'sandwich', 'lantern', 'seahorse', 'Cuba', 'archer', 'sweat', 'deodorant', 'plank', 'Steam', 'birthday', 'submarine', 'zombie', 'casino', 'gas', 'stove', 'helmet', 'mosquito', 'ponytail', 'corpse', 'subway', 'spy', 'jump rope', 'baguette', 'grin', 'centipede', 'gorilla', 'website', 'text', 'workplace', 'bookmark', 'anglerfish', 'wireless', 'Zorro', 'sports', 'abstract', 'detective', 'Amsterdam', 'elevator', 'chimney', 'reindeer', 'Singapore', 'perfume', 'soldier', 'bodyguard', 'magnifier', 'freezer', 'radiation', 'assassin', 'yawn', 'backbone', 'disaster', 'giant', 'pillow fight', 'grasshopper', 'Vin Diesel', 'geyser', 'burrito', 'celebrity', 'Lasagna', 'Pumba', 'karaoke', 'hypnotize', 'platypus', 'Leonardo DiCaprio', 'bird bath', 'battleship', 'back pain', 'rapper', 'werewolf', 'Black Friday', 'cathedral', 'Sherlock Holmes', 'ABBA', 'hard hat', 'sword', 'mirror', 'toilet', 'eggplant', 'jelly', 'hero', 'starfish', 'bread', 'snail', 'person', 'plunger', 'computer', 'nosebleed', 'goat', 'joker', 'sponge', 'mop', 'owl', 'beef', 'portal', 'genie', 'crocodile', 'murderer', 'magic', 'pine', 'winter', 'robber', 'pepperoni', 'shoebox', 'fog', 'screen', 'son', 'folder', 'mask', 'Goofy', 'Mercury', 'zipline', 'wall', 'dragonfly', 'zipper', 'meatball', 'slingshot', 'Pringles', 'circus', 'mammoth', 'nugget', 'mousetrap', 'recycling', 'revolver', 'champion', 'zigzag', 'meat', 'drought', 'vodka', 'notepad', 'porcupine', 'tuba', 'hacker', 'broomstick', 'kitchen', 'cheesecake', 'satellite', 'JayZ', 'squirrel', 'leprechaun', 'jello', 'gangster', 'raincoat', 'eyeshadow', 'shopping', 'gardener', 'scythe', 'portrait', 'jackhammer', 'allergy', 'honeycomb', 'headache', 'Miniclip', 'Mona Lisa', 'cheetah', 'virtual reality', 'virus', 'Argentina', 'blanket', 'military', 'headband', 'superpower', 'language', 'handshake', 'reptile', 'thirst', 'fake teeth', 'duct tape', 'macaroni', 'color-blind', 'comfortable', 'Robbie Rotten', 'coast guard', 'cab driver', 'pistachio', 'Angelina Jolie', 'autograph', 'sea lion', 'Morse code', 'clickbait', 'star', 'girl', 'lemon', 'alarm', 'shoe', 'soap', 'button', 'kiss', 'grave', 'telephone', 'fridge', 'katana', 'switch', 'eraser', 'signature', 'pasta', 'flamingo', 'crayon', 'puzzle', 'hard', 'juice', 'socks', 'crystal', 'telescope', 'galaxy', 'squid', 'tattoo', 'bowling', 'lamb', 'silver', 'lid', 'taxi', 'basket', 'step', 'stapler', 'pigeon', 'zoom', 'teacher', 'holiday', 'score', 'Tetris', 'frame', 'garden', 'stage', 'unicycle', 'cream', 'sombrero', 'error', 'battle', 'starfruit', 'hamster', 'chalk', 'spiral', 'bounce', 'hairspray', 'lizard', 'victory', 'balance', 'hexagon', 'Ferrari', 'MTV', 'network', 'weapon', 'fist fight', 'vault', 'mattress', 'viola', 'birch', 'stereo', 'Jenga', 'plug', 'chihuahua', 'plow', 'pavement', 'wart', 'ribbon', 'otter', 'magazine', 'Bomberman', 'vaccine', 'elder', 'Romania', 'champagne', 'semicircle', 'Suez Canal', 'Mr Meeseeks', 'villain', 'inside', 'spade', 'gravedigger', 'Bruce Lee', 'gentle', 'stingray', 'can opener', 'funeral', 'jet ski', 'wheelbarrow', 'thug', 'undo', 'fabulous', 'space suit', 'cappuccino', 'Minotaur', 'skydiving', 'cheerleader', 'Stone Age', 'Chinatown', 'razorblade', 'crawl space', 'cauldron', 'trick shot', 'Steve Jobs', 'audience', 'time machine', 'sewing machine', 'face paint', 'truck driver', 'x-ray', 'fly', 'salt', 'spider', 'boy', 'dollar', 'turtle', 'book', 'chain', 'dolphin', 'sing', 'milk', 'wing', 'pencil', 'snake', 'scream', 'toast', 'vomit', 'salad', 'radio', 'potion', 'dominoes', 'balloon', 'monkey', 'trophy', 'feather', 'leash', 'loser', 'bite', 'notebook', 'happy', 'Mummy', 'sneeze', 'koala', 'tired', 'sick', 'pipe', 'jalapeno', 'diaper', 'deer', 'priest', 'youtuber', 'boomerang', 'pro', 'ruby', 'hop', 'hopscotch', 'barcode', 'vote', 'wrench', 'tissue', 'doll', 'clownfish', 'halo', 'Monday', 'tentacle', 'grid', 'Uranus', 'oil', 'scarecrow', 'tarantula', 'germ', 'glow', 'haircut', 'Vatican', 'tape', 'judge', 'cell', 'diagonal', 'science', 'mustard', 'fur', 'janitor', 'ballerina', 'pike', 'nun', 'chime', 'tuxedo', 'Cerberus', 'panpipes', 'surface', 'coal', 'knot', 'willow', 'pajamas', 'fizz', 'student', 'eclipse', 'asteroid', 'Portugal', 'pigsty', 'brand', 'crowbar', 'chimpanzee', 'Chuck Norris', 'raft', 'carnival', 'treadmill', 'professor', 'tricycle', 'apocalypse', 'vitamin', 'orchestra', 'groom', 'cringe', 'knight', 'litter box', 'macho', 'brownie', 'hummingbird', 'Hula Hoop', 'motorbike', 'type', 'catapult', 'take off', 'wake up', 'concert', 'floppy disk', 'BMX', 'bulldozer', 'manicure', 'brainwash', 'William Wallace', 'guinea pig', 'motherboard', 'wheel', 'brick', 'egg', 'lava', 'queen', 'gold', 'God', 'ladder', 'coin', 'laptop', 'toaster', 'butter', 'bag', 'doctor', 'sit', 'tennis', 'half', 'Bible', 'noodle', 'golf', 'eagle', 'cash', 'vampire', 'sweater', 'father', 'remote', 'safe', 'jeans', 'darts', 'graph', 'nothing', 'dagger', 'stone', 'wig', 'cupboard', 'minute', 'match', 'slime', 'garage', 'tomb', 'soup', 'bathroom', 'llama', 'shampoo', 'swan', 'frown', 'toolbox', 'jacket', 'adult', 'crate', 'quill', 'spin', 'waiter', 'mint', 'kangaroo', 'captain', 'loot', 'maid', 'shoelace', 'luggage', 'cage', 'bagpipes', 'loaf', 'aircraft', 'shelf', 'safari', 'afterlife', 'napkin', 'steam', 'coach', 'slope', 'marigold', 'Mozart', 'bumper', 'Asterix', 'vanilla', 'papaya', 'ostrich', 'failure', 'scoop', 'tangerine', 'firefly', 'centaur', 'harbor', 'uniform', 'Beethoven', 'Intel', 'moth', 'Spartacus', 'fluid', 'acid', 'sparkles', 'talent show', 'ski jump', 'polo', 'ravioli', 'delivery', 'woodpecker', 'logo', 'Stegosaurus', 'diss track', 'Darwin Watterson', 'filmmaker', 'silence', 'dashboard', 'echo', 'windshield', 'Home Alone', 'tablecloth', 'backflip', 'headboard', 'licorice', 'sunshade', 'Picasso', 'airbag', 'water cycle', 'meatloaf', 'insomnia', 'broom', 'whale', 'pie', 'demon', 'bed', 'braces', 'fence', 'orange', 'sleep', 'gift', 'Popsicle', 'spear', 'zebra', 'Saturn', 'maze', 'chess', 'wire', 'angel', 'skates', 'pyramid', 'shower', 'claw', 'hell', 'goal', 'bottle', 'dress', 'walk', 'AC/DC', 'tampon', 'goatee', 'prince', 'flask', 'cut', 'cord', 'roof', 'movie', 'ash', 'tiger', 'player', 'magician', 'wool', 'saddle', 'cowboy', 'derp', 'suitcase', 'sugar', 'nest', 'anchor', 'onion', 'magma', 'limbo', 'collar', 'mole', 'bingo', 'walnut', 'wealth', 'security', 'leader', 'melt', 'Gandhi', 'arch', 'toy', 'turd', 'scientist', 'hippo', 'glue', 'kneel', 'orbit', 'below', 'totem', 'health', 'towel', 'diet', 'crow', 'addiction', 'minigolf', 'clay', 'boar', 'navy', 'butcher', 'trigger', 'referee', 'bruise', 'translate', 'yearbook', 'confused', 'engine', 'poke', 'wreath', 'omelet', 'gravity', 'bride', 'godfather', 'flu', 'accordion', 'engineer', 'cocoon', 'minivan', 'bean bag', 'antivirus', 'billiards', 'rake', 'cement', 'cauliflower', 'espresso', 'violence', 'blender', 'chew', 'bartender', 'witness', 'hobbit', 'corkscrew', 'chameleon', 'cymbal', 'Excalibur', 'grapefruit', 'action', 'outside', 'guillotine', 'timpani', 'frostbite', 'leave', 'Mont Blanc', 'palette', 'electrician', 'fitness trainer', 'journalist', 'fashion designer', 'bucket', 'penguin', 'sheep', 'torch', 'robot', 'peanut', 'UFO', 'belt', 'Earth', 'magnet', 'dragon', 'soccer', 'desk', 'search', 'seal', 'scribble', 'gender', 'food', 'anvil', 'crust', 'bean', 'hockey', 'pot', 'pretzel', 'needle', 'blimp', 'plate', 'drool', 'frog', 'basement', 'idea', 'bracelet', 'cork', 'sauce', 'gang', 'sprinkler', 'shout', 'morning', 'poodle', 'karate', 'bagel', 'wolf', 'sausage', 'heat', 'wasp', 'calendar', 'tadpole', 'religion', 'hose', 'sleeve', 'acorn', 'sting', 'market', 'marble', 'comet', 'pain', 'cloth', 'drawer', 'orca', 'hurdle', 'pinball', 'narwhal', 'pollution', 'metal', 'race', 'end', 'razor', 'dollhouse', 'distance', 'prism', 'pub', 'lotion', 'vanish', 'vulture', 'beanie', 'burp', 'periscope', 'cousin', 'customer', 'label', 'mold', 'kebab', 'beaver', 'spark', 'meme', 'pudding', 'almond', 'mafia', 'gasp', 'nightmare', 'mermaid', 'season', 'gasoline', 'evening', 'eel', 'cast', 'hive', 'beetle', 'diploma', 'jeep', 'bulge', 'wrestler', 'Anubis', 'mascot', 'spinach', 'hieroglyph', 'anaconda', 'handicap', 'walrus', 'blacksmith', 'robin', 'reception', 'invasion', 'fencing', 'sphinx', 'evolution', 'brunette', 'traveler', 'jaguar', 'diagram', 'hovercraft', 'parade', 'dome', 'credit', 'tow truck', 'shallow', 'vlogger', 'veterinarian', 'furniture', 'commercial', 'cyborg', 'scent', 'defense', 'accident', 'marathon', 'demonstration', 'NASCAR', 'Velociraptor', 'pharmacist', 'Xerox', 'gentleman', 'dough', 'rhinoceros', 'air conditioner', 'poop', 'clock', 'carrot', 'cherry', 'candle', 'boots', 'target', 'wine', 'die', 'moon', 'airplane', 'think', 'pause', 'pill', 'pocket', 'Easter', 'horse', 'child', 'lamp', 'pillow', 'yolk', 'potato', 'pickle', 'nurse', 'ham', 'ninja', 'screw', 'board', 'pin', 'lettuce', 'console', 'climb', 'goose', 'bill', 'tortoise', 'sink', 'ski', 'glitter', 'miner', 'parrot', 'clap', 'spit', 'wiggle', 'peacock', 'roll', 'ballet', 'ceiling', 'celebrate', 'blind', 'yacht', 'addition', 'flock', 'powder', 'paddle', 'harpoon', 'kraken', 'baboon', 'antenna', 'classroom', 'bronze', 'writer', 'Obelix', 'touch', 'sensei', 'rest', 'puma', 'dent', 'shake', 'goblin', 'laundry', 'cloak', 'detonate', 'Neptune', 'cotton', 'generator', 'canary', 'horsewhip', 'racecar', 'Croatia', 'tip', 'cardboard', 'commander', 'seasick', 'anthill', 'vinegar', 'hippie', 'dentist', 'animation', 'Slinky', 'wallpaper', 'pendulum', 'vertical', 'chestplate', 'anime', 'beanstalk', 'survivor', 'florist', 'faucet', 'spore', 'risk', 'wonderland', 'wrestling', 'hazelnut', 'cushion', 'W-LAN', 'mayor', 'community', 'raisin', 'udder', 'oyster', 'sew', 'hazard', 'curry', 'pastry', 'mime', 'victim', 'mechanic', 'hibernate', 'bouncer', 'Iron Giant', 'floodlight', 'pear', 'sad', 'paw', 'space', 'bullet', 'skribbl.io', 'shirt', 'cow', 'worm', 'king', 'tea', 'truck', 'pants', 'hashtag', 'DNA', 'bird', 'Monster', 'beer', 'curtain', 'tire', 'nachos', 'bear', 'cricket', 'teapot', 'nerd', 'deaf', 'fruit', 'meteorite', 'rice', 'sniper', 'sale', 'gnome', 'shock', 'shape', 'alligator', 'meal', 'nickel', 'party', 'hurt', 'Segway', 'Mr. Bean', 'banker', 'cartoon', 'double', 'hammock', 'juggle', 'pope', 'leak', 'room', 'throne', 'hoof', 'radar', 'wound', 'luck', 'swag', 'panther', 'flush', 'Venus', 'disease', 'fortune', 'porch', 'machine', 'pilot', 'copper', 'mantis', 'keg', 'biology', 'wax', 'gloss', 'leech', 'sculpture', 'pelican', 'trapdoor', 'plague', 'quilt', 'yardstick', 'lounge', 'teaspoon', 'broadcast', 'uncle', 'comedian', 'mannequin', 'peasant', 'streamer', 'oar', 'drama', 'cornfield', 'carnivore', 'wingnut', 'vent', 'cabinet', 'vacation', 'applause', 'vision', 'radish', 'picnic', 'Skrillex', 'jester', 'preach', 'armadillo', 'hyena', 'librarian', 'interview', 'sauna', 'surgeon', 'dishrag', 'manatee', 'symphony', 'queue', 'industry', 'Atlantis', 'excavator', 'canister', 'model', 'flight attendant', 'ghost', 'pig', 'key', 'banana', 'tomato', 'axe', 'line', 'present', 'duck', 'alien', 'peas', 'gem', 'web', 'grapes', 'corn', 'can', 'fairy', 'camel', 'paper', 'beak', 'corner', 'penny', 'dig', 'link', 'donkey', 'fox', 'rug', 'drip', 'hunter', 'horn', 'purse', 'gumball', 'pony', 'musket', 'flea', 'kettle', 'rooster', 'balcony', 'seesaw', 'stork', 'dinner', 'greed', 'bait', 'duel', 'trap', 'heist', 'origami', 'skunk', 'coaster', 'leather', 'socket', 'fireside', 'cannon', 'ram', 'filter', 'alpaca', 'Zelda', 'condiment', 'server', 'antelope', 'emu', 'chestnut', 'dalmatian', 'swarm', 'sloth', 'reality', 'Darwin', 'torpedo', 'toucan', 'pedal', 'tabletop', 'frosting', 'bellow', 'vortex', 'bayonet', 'margarine', 'orchid', 'beet', 'journey', 'slam', 'marmalade', 'employer', 'stylus', 'spoiler', 'repeat', 'tiramisu', 'cuckoo', 'collapse', 'eskimo', 'assault', 'orangutan', 'wrapping', 'albatross', 'mothball', 'evaporate', 'turnip', 'puffin', 'reeds', 'receptionist', 'impact', 'dispenser', 'nutshell', 'procrastination', 'architect', 'programmer', 'bricklayer', 'boat', 'bell', 'ring', 'fries', 'money', 'chair', 'door', 'bee', 'tail', 'ball', 'mouse', 'rat', 'window', 'peace', 'nut', 'blush', 'page', 'toad', 'hug', 'ace', 'tractor', 'peach', 'whisk', 'hen', 'day', 'shy', 'lawyer', 'rewind', 'tripod', 'trailer', 'hermit', 'welder', 'festival', 'punk', 'handle', 'protest', 'lens', 'attic', 'foil', 'promotion', 'work', 'limousine', 'patriot', 'badger', 'studio', 'athlete', 'quokka', 'trend', 'pinwheel', 'gravel', 'fabric', 'lemur', 'provoke', 'rune', 'display', 'nail file', 'embers', 'asymmetry', 'actor', 'carpenter', 'aristocrat', 'Zuma', 'chinchilla', 'archaeologist', 'apple', 'hat', 'sun', 'box', 'cat', 'cup', 'train', 'bunny', 'sound', 'run', 'barrel', 'barber', 'grill', 'read', 'family', 'moose', 'boil', 'printer', 'poster', 'sledge', 'nutmeg', 'heading', 'cruise', 'pillar', 'retail', 'monk', 'spool', 'catalog', 'scuba', 'anteater', 'pensioner', 'coyote', 'vise', 'bobsled', 'purity', 'tailor', 'meerkat', 'weasel', 'invention', 'lynx', 'kendama', 'zeppelin', 'patient', 'gladiator', 'slump', 'Capricorn', 'baklava', 'prune', 'stress', 'crucible', 'hitchhiker', 'election', 'caviar', 'marmot', 'hair roller', 'pistol', 'cone', 'ant', 'lock', 'hanger', 'cap', 'Mr. Meeseeks', 'comedy', 'coat', 'tourist', 'tickle', 'facade', 'shrew', 'diva', 'patio', 'apricot', 'spelunker', 'parakeet', 'barbarian', 'tumor', 'figurine', 'desperate', 'landlord', 'bus', 'mug', 'dog', 'shark'];

    return wordlist[Math.floor(Math.random() * wordlist.length)]
}

let players = [];
const socs = new Set();

class Player {
    constructor(playerName, socID, isRoomOwner = false) {
        this.playerName = playerName;
        this.socID = socID;
        this.isRoomOwner = isRoomOwner;
        this.score = 0;
    }

    getPlayerSocID() {
        return this.socID;
    }

    getPlayerName() {
        return this.playerName;
    }

    getIsRoomOwner() {
        return this.isRoomOwner;
    }

    setScore(val) {
        this.score = val;
    }

    getScore() {
        return this.score;
    }
}

function resetGameState() {
    hasGameStarted = false;
    wordToDraw = null;
    wordOptions = [];
    chosenPlayer = undefined;
    guessersList = [];
    scoreBoard = [];
    drawHistory = [];
    currentPenColor = '#000000';

    if (cancelChooseWordTimer != null) {
        cancelChooseWordTimer();
        cancelChooseWordTimer = null;
    }

    if (cancelDrawTimer != null) {
        cancelDrawTimer();
        cancelDrawTimer = null;
    }
}

function abortCurrentTurn() {
    roundToken += 1;

    if (cancelChooseWordTimer != null) {
        cancelChooseWordTimer();
        cancelChooseWordTimer = null;
    }

    if (cancelDrawTimer != null) {
        cancelDrawTimer();
        cancelDrawTimer = null;
    }
}

function replayCurrentGameState(socket) {
    if (!hasGameStarted) {
        return;
    }

    socket.emit('gameStarted');

    if (chosenPlayer != null) {
        socket.emit('chosenPlayer', chosenPlayer);
    }

    if (wordToDraw != null) {
        socket.emit('wordCount', wordToDraw.length);
    }

    replayDrawingHistory(socket);
}

function replayDrawingHistory(target) {
    drawHistory.forEach(entry => {
        if (entry.type === 'clearCanvas') {
            target.emit('clearCanvas');
        } else if (entry.type === 'penColor') {
            target.emit('penColor', entry.value);
        } else if (entry.type === 'startPaint') {
            target.emit('startPaint', entry.value);
        } else if (entry.type === 'position') {
            target.emit('otherPOS', entry.value);
        } else if (entry.type === 'canvasImage') {
            target.emit('canvasImage', entry.value);
        }
    });
}

function removeLastStroke() {
    let strokeEndIndex = -1;

    for (let index = drawHistory.length - 1; index >= 0; index--) {
        if (drawHistory[index].type === 'startPaint' && drawHistory[index].value === false) {
            strokeEndIndex = index;
            break;
        }
    }

    if (strokeEndIndex === -1) {
        return false;
    }

    let strokeStartIndex = -1;

    for (let index = strokeEndIndex - 1; index >= 0; index--) {
        if (drawHistory[index].type === 'startPaint' && drawHistory[index].value === true) {
            strokeStartIndex = index;
            break;
        }
    }

    if (strokeStartIndex === -1) {
        return false;
    }

    drawHistory.splice(strokeStartIndex, drawHistory.length - strokeStartIndex);
    return true;
}

function normalizeGuessText(text) {
    return String(text || '')
        .toLowerCase()
        .trim();
}

function isCloseGuess(guess, target) {
    if (!guess || !target) {
        return false;
    }

    if (guess === target) {
        return false;
    }

    const guessLength = guess.length;
    const targetLength = target.length;

    if (Math.abs(guessLength - targetLength) > 2) {
        return false;
    }

    const rows = Array.from({ length: guessLength + 1 }, (_, index) => [index]);
    rows[0] = Array.from({ length: targetLength + 1 }, (_, index) => index);

    for (let rowIndex = 1; rowIndex <= guessLength; rowIndex++) {
        rows[rowIndex] = [rowIndex];
        for (let columnIndex = 1; columnIndex <= targetLength; columnIndex++) {
            const substitutionCost = guess[rowIndex - 1] === target[columnIndex - 1] ? 0 : 1;
            rows[rowIndex][columnIndex] = Math.min(
                rows[rowIndex - 1][columnIndex] + 1,
                rows[rowIndex][columnIndex - 1] + 1,
                rows[rowIndex - 1][columnIndex - 1] + substitutionCost
            );
        }
    }

    return rows[guessLength][targetLength] <= 2;
}

playersList = {}
var soc;
var uniqueName = true;
// When a client connects to the server
io.on('connection', socket => {
    soc = socket;
    console.log('A user connected:', socket.id);
    socs.add(socket);
    socket.join(FIXED_ROOM);

    socket.on('playerName', pName => {
        players.forEach(p => {
            if (p.getPlayerName() == pName) {
                socket.disconnect();
                uniqueName = false;
                return;
            }
        });
        if (!uniqueName) {
            uniqueName = true;
            return;
        }
        if (uniqueName) {
            let newPlayerJoined = new Player(pName, socket);
            players.push(newPlayerJoined);
        }

        playersList[pName] = 0;
        socket.broadcast.to(FIXED_ROOM).emit('newPlayerJoined', pName);
        socket.emit('playersList', JSON.stringify(playersList));

        if (!hasGameStarted) {
            hasGameStarted = true;
            gameStart();
            return;
        }

        replayCurrentGameState(socket);

        uniqueName = true;
    });

    socket.emit('welcom', "welcome to skribbl");

    socket.on('position', position => {
        // Broadcast the message to all clients
        drawHistory.push({ type: 'position', value: position });
        socket.broadcast.to(FIXED_ROOM).emit('otherPOS', position);

    });

    socket.on('startPaint', paint => {
        drawHistory.push({ type: 'startPaint', value: paint });
        socket.broadcast.to(FIXED_ROOM).emit('startPaint', paint);
    });



    socket.on('startGame', () => {
        if (!hasGameStarted) {
            hasGameStarted = true;
            gameStart();
        }
    });

    socket.on('penColor', hexValue => {
        currentPenColor = hexValue;
        drawHistory.push({ type: 'penColor', value: hexValue });
        io.to(FIXED_ROOM).emit('penColor', hexValue);

    });

    socket.on('canvasImage', dataURL => {
        // store the full canvas snapshot in history and broadcast to others
        drawHistory.push({ type: 'canvasImage', value: dataURL });
        socket.broadcast.to(FIXED_ROOM).emit('canvasImage', dataURL);
    });

    socket.on('clearCanvas', () => {
        drawHistory = [{ type: 'clearCanvas' }];
        io.to(FIXED_ROOM).emit('clearCanvas');
    });

    socket.on('undoStroke', () => {
        const currentPlayer = players.find(player => player.getPlayerSocID().id === socket.id);

        if (!currentPlayer || currentPlayer.getPlayerName() !== chosenPlayer) {
            return;
        }

        if (!removeLastStroke()) {
            return;
        }

        io.to(FIXED_ROOM).emit('clearCanvas');
        replayDrawingHistory(io.to(FIXED_ROOM));
    });

    socket.on('vote', status => {
        io.sockets.emit('vote', status);
    });


    socket.on('chosenWord', cWord => {
        wordToDraw = cWord;
        io.to(FIXED_ROOM).emit('wordCount', cWord.length)
        cancelChooseWordTimer();
    });



    socket.on('updateText', receivedMsg => {
        if (wordToDraw == null) {
            if (!receivedMsg[1].includes("//admin")) {
                io.sockets.emit('chatContent', receivedMsg);
            }
            return;
        }

        const formattedWord = normalizeGuessText(receivedMsg[1]);
        const formattedGuessWord = normalizeGuessText(wordToDraw);



        if (receivedMsg[1].includes("//admin")) {
            adminControl(receivedMsg[1]);
        }


        if (formattedGuessWord == formattedWord && !guessersList.includes(receivedMsg[0]) && players.length > 1) {
            io.sockets.emit('correctGuess', [receivedMsg[0], wordToDraw]);
            guessersList.push(receivedMsg[0]);
        } else if (isCloseGuess(formattedWord, formattedGuessWord) && !guessersList.includes(receivedMsg[0])) {
            io.sockets.emit('chatContent', receivedMsg);
            io.sockets.emit('chatContent', [receivedMsg[0], "almost"]);
        } else if (!receivedMsg[1].includes("//admin")) {
            io.sockets.emit('chatContent', receivedMsg);
        }

        if (guessersList.length == players.length - 1 && cancelDrawTimer != null) {
            io.sockets.emit('allGuessed');
            cancelDrawTimer();
        }

        

    });

    function adminControl(command) {
        var commands = command.split(" ");
        if (commands[1] == chatAdminPWD) {
            if (commands[2] == "kickall") {
                socs.forEach(s => {
                    s.disconnect(true);
                });
                console.log(">Admin kicked all players.");
            } else if (commands[2] == "kick") {
                players.forEach(p => {
                    if (p.getPlayerName() == commands[3]) {
                        socs.forEach(soc => {
                            if (p.getPlayerSocID().id == soc.id) {
                                soc.disconnect();
                                io.to(FIXED_ROOM).emit('chatContent', ["kick", commands[3]]);
                                console.log(`>Admin kicked ${commands[3]}`);
                            }
                        });
                    }
                });
            } else if (commands[2] == "givePoints") {
                players.forEach(p => {
                    if (p.getPlayerName() == commands[3]) {
                        p.setScore(parseInt(commands[4]));
                        console.log(`>Admin added ${commands[4]}Points to ${commands[3]}`);
                    }
                });
            } else if (commands[2] == "setdrawtime") {
                var oldDrawTime = drawTime;
                drawTime = parseInt(commands[3]);
                console.log(`>Admin set draw time from ${oldDrawTime} to ${commands[3]}`);
            } else if (commands[2] == "setchoosetime") {
                var oldChooseTime = chooseWordTime;
                chooseWordTime = parseInt(commands[3]);
                console.log(`>Admin set time to choose word from ${oldChooseTime} to ${commands[3]}`);
            } else if (command[2] == "restart") {
                io.to(FIXED_ROOM).emit('gameStarted');
                hasGameStarted = true;
                gameStart();
            }
        }
    }

    // When the client disconnects
    socket.on('disconnect', () => {
        //delete (users[socket.id])
        console.log('A user disconnected: ', socket.id);
        players.forEach(function (p, i) {
            if (p.getPlayerSocID().id == socket.id) {
                const isCurrentDrawer = chosenPlayer == p.getPlayerName();

                if (isCurrentDrawer) {
                    abortCurrentTurn();
                    console.log("Drawing player left...");
                    io.to(FIXED_ROOM).emit('chatContent', ['Server', 'drawer left, skipping to next player']);
                }

                socket.broadcast.to(FIXED_ROOM).emit('playerLeft', p.getPlayerName());
                players.splice(i, 1);
                delete playersList[p.getPlayerName()];

                if (i < playerIndex) {
                    playerIndex -= 1;
                }

                if (isCurrentDrawer && players.length > 0) {
                    if (playerIndex >= players.length) {
                        playerIndex = 0;
                    }

                    wordToDraw = null;
                    chosenPlayer = undefined;
                    guessersList = [];
                    drawHistory = [{ type: 'clearCanvas' }];
                    io.to(FIXED_ROOM).emit('clearCanvas');
                    gameStart();
                    return;
                }

                if (players.length === 0) {
                    resetGameState();
                }
            }
        });
    });




    async function Fun() {
        const activeRoundToken = roundToken;
        cancelChooseWordTimer = null;
        cancelDrawTimer = null;
        guessersList = [];
        scoreBoard = [];
        io.to(FIXED_ROOM).emit('chooseStart', chooseWordTime);
        await chooseWordtimer();
        if (activeRoundToken !== roundToken) {
            return;
        }
        io.to(FIXED_ROOM).emit('chooseEnd');
        if (wordToDraw == null) {
            wordToDraw = wordOptions[0];
            console.log("AUTO CHOSEN WORD: ", wordToDraw);
            io.to(FIXED_ROOM).emit('wordCount', wordToDraw.length)
            io.to(FIXED_ROOM).emit('chosenWord', [wordToDraw, chosenPlayer]);
        }
        if (activeRoundToken !== roundToken) {
            return;
        }
        io.to(FIXED_ROOM).emit("drawStart", drawTime);
        await Drawingtimer();
        if (activeRoundToken !== roundToken) {
            return;
        }
        io.to(FIXED_ROOM).emit('drawEnd');
        function calculateScore(playerIndex) {
            if (playerIndex === 0) {
                return 300;
            } else {
                const baseScore = 290;
                const scoreReduction = (playerIndex - 1) * 10;
                return baseScore - scoreReduction;
            }
        }
        function reduceScoreOnTime() {

        }

        for (let i = 0; i < guessersList.length; i++) {
            const player = guessersList[i];
            const score = calculateScore(i);
            players.forEach(element => {
                if (element.getPlayerName() == guessersList[i]) {
                    var s = element.getScore() + score;
                    element.setScore(s);
                    scoreBoard.push([element.getPlayerName(), element.getScore()]);
                }
                if (element.getPlayerName() == chosenPlayer && guessersList.length != 0) {
                    scoreBoard.push([chosenPlayer, element.getScore() + 100]);
                }

            });




        }
        io.to(FIXED_ROOM).emit('scoreBoard', scoreBoard);


        function chooseWordtimer() {
            return new Promise((res) => {
                cancelChooseWordTimer = res;
                var t = setTimeout(() => {
                    res();
                    clearTimeout(t);
                }, (chooseWordTime * 1000) + 10);
            });
        }

        function Drawingtimer() {
            return new Promise((res) => {
                cancelDrawTimer = res;
                var t = drawTimerID = setTimeout(() => {
                    res();
                    clearTimeout(t);
                }, (drawTime * 1000) + 10);

            });
        }
        if (activeRoundToken !== roundToken) {
            return;
        }
        gameStart();
    }


    function gameStart() {
        io.to(FIXED_ROOM).emit('gameStarted');
        wordToDraw = null;
        wordOptions = [];
        if (playerIndex <= players.length - 1) {
            chosenPlayer = players[playerIndex].getPlayerName();
            drawHistory = [{ type: 'clearCanvas' }];

            for (let i = 0; i < 3; i++) {
                var genWord = random_word_gen();
                if (!wordOptions.includes(genWord)) {
                    wordOptions.push(genWord);
                } else {
                    wordOptions.push(random_word_gen());
                }
            }
            io.to(FIXED_ROOM).emit('chosenPlayer', chosenPlayer);
            io.to(FIXED_ROOM).emit('wordList', wordOptions);
            playerIndex++;
            Fun();
        } else {
            playerIndex = 0;
            console.log("END OF GAME...");
            io.to(FIXED_ROOM).emit('gameOver');
            if (players.length > 0) {
                setTimeout(() => {
                    if (players.length > 0) {
                        gameStart();
                    }
                }, 1000);
            }
        }
    }

});



// Start the server
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



server.listen(port, () => {
    console.log(`Listening on port ${port}...`);
    console.log(`Open -> http://localhost:${port} to play :)`)
});