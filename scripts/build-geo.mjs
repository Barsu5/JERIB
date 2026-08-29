import fs from "fs";

/** @type {Array<[string, string, string, string, Array<[string, string, string, number, number]>]>} */
const RAW = [
  ["us", "United States", "США", "north_america", [
    ["new_york", "New York", "Нью-Йорк", 40.7128, -74.006],
    ["los_angeles", "Los Angeles", "Лос-Анджелес", 34.0522, -118.2437],
    ["chicago", "Chicago", "Чикаго", 41.8781, -87.6298],
    ["houston", "Houston", "Хьюстон", 29.7604, -95.3698],
    ["phoenix", "Phoenix", "Финикс", 33.4484, -112.074],
    ["philadelphia", "Philadelphia", "Филадельфия", 39.9526, -75.1652],
    ["san_antonio", "San Antonio", "Сан-Антонио", 29.4241, -98.4936],
    ["san_diego", "San Diego", "Сан-Диего", 32.7157, -117.1611],
    ["dallas", "Dallas", "Даллас", 32.7767, -96.797],
    ["austin", "Austin", "Остин", 30.2672, -97.7431],
    ["san_francisco", "San Francisco", "Сан-Франциско", 37.7749, -122.4194],
    ["seattle", "Seattle", "Сиэтл", 47.6062, -122.3321],
    ["denver", "Denver", "Денвер", 39.7392, -104.9903],
    ["boston", "Boston", "Бостон", 42.3601, -71.0589],
    ["miami", "Miami", "Майами", 25.7617, -80.1918],
    ["atlanta", "Atlanta", "Атланта", 33.749, -84.388],
    ["washington", "Washington", "Вашингтон", 38.9072, -77.0369],
    ["las_vegas", "Las Vegas", "Лас-Вегас", 36.1699, -115.1398],
    ["portland", "Portland", "Портленд", 45.5152, -122.6784],
  ]],
  ["ca", "Canada", "Канада", "north_america", [
    ["toronto", "Toronto", "Торонто", 43.6532, -79.3832],
    ["montreal", "Montreal", "Монреаль", 45.5017, -73.5673],
    ["vancouver", "Vancouver", "Ванкувер", 49.2827, -123.1207],
    ["calgary", "Calgary", "Калгари", 51.0447, -114.0719],
    ["ottawa", "Ottawa", "Оттава", 45.4215, -75.6972],
    ["edmonton", "Edmonton", "Эдмонтон", 53.5461, -113.4938],
    ["winnipeg", "Winnipeg", "Виннипег", 49.8951, -97.1384],
    ["quebec_city", "Quebec City", "Квебек", 46.8139, -71.208],
  ]],
  ["mx", "Mexico", "Мексика", "north_america", [
    ["mexico_city", "Mexico City", "Мехико", 19.4326, -99.1332],
    ["guadalajara", "Guadalajara", "Гвадалахара", 20.6597, -103.3496],
    ["monterrey", "Monterrey", "Монтеррей", 25.6866, -100.3161],
    ["puebla", "Puebla", "Пуэбла", 19.0414, -98.2063],
    ["tijuana", "Tijuana", "Тихуана", 32.5149, -117.0382],
    ["leon", "Leon", "Леон", 21.125, -101.686],
    ["merida", "Merida", "Мерида", 20.9674, -89.5926],
    ["cancun", "Cancun", "Канкун", 21.1619, -86.8515],
  ]],
  ["gb", "United Kingdom", "Великобритания", "europe", [
    ["london", "London", "Лондон", 51.5074, -0.1278],
    ["birmingham", "Birmingham", "Бирмингем", 52.4862, -1.8904],
    ["manchester", "Manchester", "Манчестер", 53.4808, -2.2426],
    ["glasgow", "Glasgow", "Глазго", 55.8642, -4.2518],
    ["liverpool", "Liverpool", "Ливерпуль", 53.4084, -2.9916],
    ["leeds", "Leeds", "Лидс", 53.8008, -1.5491],
    ["edinburgh", "Edinburgh", "Эдинбург", 55.9533, -3.1883],
    ["bristol", "Bristol", "Бристоль", 51.4545, -2.5879],
  ]],
  ["de", "Germany", "Германия", "europe", [
    ["berlin", "Berlin", "Берлин", 52.52, 13.405],
    ["hamburg", "Hamburg", "Гамбург", 53.5511, 9.9937],
    ["munich", "Munich", "Мюнхен", 48.1351, 11.582],
    ["cologne", "Cologne", "Кёльн", 50.9375, 6.9603],
    ["frankfurt", "Frankfurt", "Франкфурт", 50.1109, 8.6821],
    ["stuttgart", "Stuttgart", "Штутгарт", 48.7758, 9.1829],
    ["dusseldorf", "Dusseldorf", "Дюссельдорф", 51.2277, 6.7735],
    ["leipzig", "Leipzig", "Лейпциг", 51.3397, 12.3731],
  ]],
  ["fr", "France", "Франция", "europe", [
    ["paris", "Paris", "Париж", 48.8566, 2.3522],
    ["marseille", "Marseille", "Марсель", 43.2965, 5.3698],
    ["lyon", "Lyon", "Лион", 45.764, 4.8357],
    ["toulouse", "Toulouse", "Тулуза", 43.6047, 1.4442],
    ["nice", "Nice", "Ницца", 43.7102, 7.262],
    ["nantes", "Nantes", "Нант", 47.2184, -1.5536],
    ["strasbourg", "Strasbourg", "Страсбург", 48.5734, 7.7521],
    ["bordeaux", "Bordeaux", "Бордо", 44.8378, -0.5792],
  ]],
  ["it", "Italy", "Италия", "europe", [
    ["rome", "Rome", "Рим", 41.9028, 12.4964],
    ["milan", "Milan", "Милан", 45.4642, 9.19],
    ["naples", "Naples", "Неаполь", 40.8518, 14.2681],
    ["turin", "Turin", "Турин", 45.0703, 7.6869],
    ["palermo", "Palermo", "Палермо", 38.1157, 13.3615],
    ["genoa", "Genoa", "Генуя", 44.4056, 8.9463],
    ["bologna", "Bologna", "Болонья", 44.4949, 11.3426],
    ["florence", "Florence", "Флоренция", 43.7696, 11.2558],
  ]],
  ["es", "Spain", "Испания", "europe", [
    ["madrid", "Madrid", "Мадрид", 40.4168, -3.7038],
    ["barcelona", "Barcelona", "Барселона", 41.3851, 2.1734],
    ["valencia", "Valencia", "Валенсия", 39.4699, -0.3763],
    ["seville", "Seville", "Севилья", 37.3891, -5.9845],
    ["zaragoza", "Zaragoza", "Сарагоса", 41.6488, -0.8891],
    ["malaga", "Malaga", "Малага", 36.7213, -4.4214],
    ["bilbao", "Bilbao", "Бильбао", 43.263, -2.935],
  ]],
  ["nl", "Netherlands", "Нидерланды", "europe", [
    ["amsterdam", "Amsterdam", "Амстердам", 52.3676, 4.9041],
    ["rotterdam", "Rotterdam", "Роттердам", 51.9244, 4.4777],
    ["the_hague", "The Hague", "Гаага", 52.0705, 4.3007],
    ["utrecht", "Utrecht", "Утрехт", 52.0907, 5.1214],
    ["eindhoven", "Eindhoven", "Эйндховен", 51.4416, 5.4697],
  ]],
  ["be", "Belgium", "Бельгия", "europe", [
    ["brussels", "Brussels", "Брюссель", 50.8503, 4.3517],
    ["antwerp", "Antwerp", "Антверпен", 51.2194, 4.4025],
    ["ghent", "Ghent", "Гент", 51.0543, 3.7174],
    ["charleroi", "Charleroi", "Шарлеруа", 50.4108, 4.4446],
    ["bruges", "Bruges", "Брюгге", 51.2093, 3.2247],
  ]],
  ["pl", "Poland", "Польша", "europe", [
    ["warsaw", "Warsaw", "Варшава", 52.2297, 21.0122],
    ["krakow", "Krakow", "Краков", 50.0647, 19.945],
    ["lodz", "Lodz", "Лодзь", 51.7592, 19.456],
    ["wroclaw", "Wroclaw", "Вроцлав", 51.1079, 17.0385],
    ["poznan", "Poznan", "Познань", 52.4064, 16.9252],
    ["gdansk", "Gdansk", "Гданьск", 54.352, 18.6466],
  ]],
  ["se", "Sweden", "Швеция", "europe", [
    ["stockholm", "Stockholm", "Стокгольм", 59.3293, 18.0686],
    ["gothenburg", "Gothenburg", "Гётеборг", 57.7089, 11.9746],
    ["malmo", "Malmo", "Мальмё", 55.605, 13.0038],
    ["uppsala", "Uppsala", "Уппсала", 59.8586, 17.6389],
  ]],
  ["no", "Norway", "Норвегия", "europe", [
    ["oslo", "Oslo", "Осло", 59.9139, 10.7522],
    ["bergen", "Bergen", "Берген", 60.3913, 5.3221],
    ["trondheim", "Trondheim", "Тронхейм", 63.4305, 10.3951],
    ["stavanger", "Stavanger", "Ставангер", 58.97, 5.7331],
  ]],
  ["dk", "Denmark", "Дания", "europe", [
    ["copenhagen", "Copenhagen", "Копенгаген", 55.6761, 12.5683],
    ["aarhus", "Aarhus", "Орхус", 56.1629, 10.2039],
    ["odense", "Odense", "Оденсе", 55.4038, 10.4024],
  ]],
  ["fi", "Finland", "Финляндия", "europe", [
    ["helsinki", "Helsinki", "Хельсинки", 60.1699, 24.9384],
    ["espoo", "Espoo", "Эспоо", 60.2055, 24.6559],
    ["tampere", "Tampere", "Тампере", 61.4978, 23.761],
    ["turku", "Turku", "Турку", 60.4518, 22.2666],
  ]],
  ["ie", "Ireland", "Ирландия", "europe", [
    ["dublin", "Dublin", "Дублин", 53.3498, -6.2603],
    ["cork", "Cork", "Корк", 51.8985, -8.4756],
    ["galway", "Galway", "Голуэй", 53.2707, -9.0568],
  ]],
  ["pt", "Portugal", "Португалия", "europe", [
    ["lisbon", "Lisbon", "Лиссабон", 38.7223, -9.1393],
    ["porto", "Porto", "Порту", 41.1579, -8.6291],
    ["braga", "Braga", "Брага", 41.5454, -8.4265],
    ["faro", "Faro", "Фару", 37.0194, -7.9322],
  ]],
  ["at", "Austria", "Австрия", "europe", [
    ["vienna", "Vienna", "Вена", 48.2082, 16.3738],
    ["graz", "Graz", "Грац", 47.0707, 15.4395],
    ["linz", "Linz", "Линц", 48.3069, 14.2858],
    ["salzburg", "Salzburg", "Зальцбург", 47.8095, 13.055],
  ]],
  ["ch", "Switzerland", "Швейцария", "europe", [
    ["zurich", "Zurich", "Цюрих", 47.3769, 8.5417],
    ["geneva", "Geneva", "Женева", 46.2044, 6.1432],
    ["basel", "Basel", "Базель", 47.5596, 7.5886],
    ["bern", "Bern", "Берн", 46.948, 7.4474],
    ["lausanne", "Lausanne", "Лозанна", 46.5197, 6.6323],
  ]],
  ["cz", "Czech Republic", "Чехия", "europe", [
    ["prague", "Prague", "Прага", 50.0755, 14.4378],
    ["brno", "Brno", "Брно", 49.1951, 16.6068],
    ["ostrava", "Ostrava", "Острава", 49.8209, 18.2625],
    ["plzen", "Plzen", "Пльзень", 49.7384, 13.3736],
  ]],
  ["gr", "Greece", "Греция", "europe", [
    ["athens", "Athens", "Афины", 37.9838, 23.7275],
    ["thessaloniki", "Thessaloniki", "Салоники", 40.6401, 22.9444],
    ["patras", "Patras", "Патры", 38.2466, 21.7346],
  ]],
  ["ro", "Romania", "Румыния", "europe", [
    ["bucharest", "Bucharest", "Бухарест", 44.4268, 26.1025],
    ["cluj_napoca", "Cluj-Napoca", "Клуж-Напока", 46.7712, 23.6236],
    ["timisoara", "Timisoara", "Тимишоара", 45.7489, 21.2087],
    ["iasi", "Iasi", "Яссы", 47.1585, 27.6014],
  ]],
  ["hu", "Hungary", "Венгрия", "europe", [
    ["budapest", "Budapest", "Будапешт", 47.4979, 19.0402],
    ["debrecen", "Debrecen", "Дебрецен", 47.5316, 21.6273],
    ["szeged", "Szeged", "Сегед", 46.253, 20.1414],
  ]],
  ["bg", "Bulgaria", "Болгария", "europe", [
    ["sofia", "Sofia", "София", 42.6977, 23.3219],
    ["plovdiv", "Plovdiv", "Пловдив", 42.1354, 24.7453],
    ["varna", "Varna", "Варна", 43.2141, 27.9147],
  ]],
  ["hr", "Croatia", "Хорватия", "europe", [
    ["zagreb", "Zagreb", "Загреб", 45.815, 15.9819],
    ["split", "Split", "Сплит", 43.5081, 16.4402],
    ["rijeka", "Rijeka", "Риека", 45.3271, 14.4422],
  ]],
  ["rs", "Serbia", "Сербия", "europe", [
    ["belgrade", "Belgrade", "Белград", 44.7866, 20.4489],
    ["novi_sad", "Novi Sad", "Нови-Сад", 45.2671, 19.8335],
    ["nis", "Nis", "Ниш", 43.3209, 21.8958],
  ]],
  ["sk", "Slovakia", "Словакия", "europe", [
    ["bratislava", "Bratislava", "Братислава", 48.1486, 17.1077],
    ["kosice", "Kosice", "Кошице", 48.7164, 21.2611],
  ]],
  ["si", "Slovenia", "Словения", "europe", [
    ["ljubljana", "Ljubljana", "Любляна", 46.0569, 14.5058],
    ["maribor", "Maribor", "Марибор", 46.5547, 15.6459],
  ]],
  ["lt", "Lithuania", "Литва", "europe", [
    ["vilnius", "Vilnius", "Вильнюс", 54.6872, 25.2797],
    ["kaunas", "Kaunas", "Каунас", 54.8985, 23.9036],
  ]],
  ["lv", "Latvia", "Латвия", "europe", [
    ["riga", "Riga", "Рига", 56.9496, 24.1052],
    ["daugavpils", "Daugavpils", "Даугавпилс", 55.8747, 26.5362],
  ]],
  ["ee", "Estonia", "Эстония", "europe", [
    ["tallinn", "Tallinn", "Таллин", 59.437, 24.7536],
    ["tartu", "Tartu", "Тарту", 58.3776, 26.729],
  ]],
  ["lu", "Luxembourg", "Люксембург", "europe", [
    ["luxembourg_city", "Luxembourg", "Люксембург", 49.6116, 6.1319],
  ]],
  ["mt", "Malta", "Мальта", "europe", [
    ["valletta", "Valletta", "Валлетта", 35.8989, 14.5146],
  ]],
  ["cy", "Cyprus", "Кипр", "europe", [
    ["nicosia", "Nicosia", "Никосия", 35.1856, 33.3823],
    ["limassol", "Limassol", "Лимассол", 34.7071, 33.0226],
  ]],
  ["is", "Iceland", "Исландия", "europe", [
    ["reykjavik", "Reykjavik", "Рейкьявик", 64.1466, -21.9426],
  ]],
  ["ua", "Ukraine", "Украина", "europe", [
    ["kyiv", "Kyiv", "Киев", 50.4501, 30.5234],
    ["kharkiv", "Kharkiv", "Харьков", 49.9935, 36.2304],
    ["odesa", "Odesa", "Одесса", 46.4825, 30.7233],
    ["lviv", "Lviv", "Львов", 49.8397, 24.0297],
    ["dnipro", "Dnipro", "Днепр", 48.4647, 35.0462],
  ]],
  ["by", "Belarus", "Беларусь", "europe", [
    ["minsk", "Minsk", "Минск", 53.9006, 27.559],
    ["gomel", "Gomel", "Гомель", 52.4345, 30.9754],
    ["brest", "Brest", "Брест", 52.0976, 23.7341],
  ]],
  ["md", "Moldova", "Молдова", "europe", [
    ["chisinau", "Chisinau", "Кишинёв", 47.0105, 28.8638],
  ]],
  ["al", "Albania", "Албания", "europe", [
    ["tirana", "Tirana", "Тирана", 41.3275, 19.8187],
    ["durres", "Durres", "Дуррес", 41.3231, 19.4414],
  ]],
  ["ba", "Bosnia and Herzegovina", "Босния и Герцеговина", "europe", [
    ["sarajevo", "Sarajevo", "Сараево", 43.8563, 18.4131],
    ["banja_luka", "Banja Luka", "Баня-Лука", 44.7722, 17.191],
  ]],
  ["me", "Montenegro", "Черногория", "europe", [
    ["podgorica", "Podgorica", "Подгорица", 42.4304, 19.2594],
    ["niksic", "Niksic", "Никшич", 42.7731, 18.9445],
  ]],
  ["mk", "North Macedonia", "Северная Македония", "europe", [
    ["skopje", "Skopje", "Скопье", 41.9981, 21.4254],
    ["bitola", "Bitola", "Битола", 41.0311, 21.3403],
  ]],
  ["xk", "Kosovo", "Косово", "europe", [
    ["pristina", "Pristina", "Приштина", 42.6629, 21.1655],
    ["prizren", "Prizren", "Призрен", 42.2139, 20.7397],
  ]],
  ["ad", "Andorra", "Андорра", "europe", [
    ["andorra_la_vella", "Andorra la Vella", "Андорра-ла-Велья", 42.5063, 1.5218],
  ]],
  ["mc", "Monaco", "Монако", "europe", [
    ["monaco", "Monaco", "Монако", 43.7384, 7.4246],
  ]],
  ["li", "Liechtenstein", "Лихтенштейн", "europe", [
    ["vaduz", "Vaduz", "Вадуц", 47.141, 9.5209],
  ]],
  ["sm", "San Marino", "Сан-Марино", "europe", [
    ["san_marino", "San Marino", "Сан-Марино", 43.9424, 12.4578],
  ]],
  ["br", "Brazil", "Бразилия", "south_america", [
    ["sao_paulo", "Sao Paulo", "Сан-Паулу", -23.5505, -46.6333],
    ["rio_de_janeiro", "Rio de Janeiro", "Рио-де-Жанейро", -22.9068, -43.1729],
    ["brasilia", "Brasilia", "Бразилиа", -15.8267, -47.9218],
    ["salvador", "Salvador", "Салвадор", -12.9777, -38.5016],
    ["fortaleza", "Fortaleza", "Форталеза", -3.7319, -38.5267],
    ["belo_horizonte", "Belo Horizonte", "Белу-Оризонти", -19.9167, -43.9345],
    ["curitiba", "Curitiba", "Куритиба", -25.4284, -49.2733],
    ["recife", "Recife", "Ресифи", -8.0476, -34.877],
  ]],
  ["ar", "Argentina", "Аргентина", "south_america", [
    ["buenos_aires", "Buenos Aires", "Буэнос-Айрес", -34.6037, -58.3816],
    ["cordoba", "Cordoba", "Кордова", -31.4201, -64.1888],
    ["rosario", "Rosario", "Росарио", -32.9442, -60.6505],
    ["mendoza", "Mendoza", "Мендоса", -32.8895, -68.8458],
  ]],
  ["cl", "Chile", "Чили", "south_america", [
    ["santiago", "Santiago", "Сантьяго", -33.4489, -70.6693],
    ["valparaiso", "Valparaiso", "Вальпараисо", -33.0472, -71.6127],
    ["concepcion", "Concepcion", "Консепсьон", -36.8201, -73.0444],
  ]],
  ["co", "Colombia", "Колумбия", "south_america", [
    ["bogota", "Bogota", "Богота", 4.711, -74.0721],
    ["medellin", "Medellin", "Медельин", 6.2476, -75.5658],
    ["cali", "Cali", "Кали", 3.4516, -76.532],
    ["barranquilla", "Barranquilla", "Барранкилья", 10.9685, -74.7813],
  ]],
  ["pe", "Peru", "Перу", "south_america", [
    ["lima", "Lima", "Лима", -12.0464, -77.0428],
    ["arequipa", "Arequipa", "Арекипа", -16.409, -71.5375],
    ["trujillo", "Trujillo", "Трухильо", -8.1116, -79.0288],
  ]],
  ["ve", "Venezuela", "Венесуэла", "south_america", [
    ["caracas", "Caracas", "Каракас", 10.4806, -66.9036],
    ["maracaibo", "Maracaibo", "Маракайбо", 10.6666, -71.6125],
    ["valencia_ve", "Valencia", "Валенсия", 10.1621, -68.0077],
  ]],
  ["ec", "Ecuador", "Эквадор", "south_america", [
    ["quito", "Quito", "Кито", -0.1807, -78.4678],
    ["guayaquil", "Guayaquil", "Гуаякиль", -2.1894, -79.8865],
  ]],
  ["bo", "Bolivia", "Боливия", "south_america", [
    ["la_paz", "La Paz", "Ла-Пас", -16.4897, -68.1193],
    ["santa_cruz", "Santa Cruz", "Санта-Крус", -17.7833, -63.1821],
  ]],
  ["py", "Paraguay", "Парагвай", "south_america", [
    ["asuncion", "Asuncion", "Асунсьон", -25.2637, -57.5759],
    ["ciudad_del_este", "Ciudad del Este", "Сьюдад-дель-Эсте", -25.5097, -54.6115],
  ]],
  ["uy", "Uruguay", "Уругвай", "south_america", [
    ["montevideo", "Montevideo", "Монтевидео", -34.9011, -56.1645],
  ]],
  ["gy", "Guyana", "Гайана", "south_america", [
    ["georgetown", "Georgetown", "Джорджтаун", 6.8013, -58.1551],
  ]],
  ["sr", "Suriname", "Суринам", "south_america", [
    ["paramaribo", "Paramaribo", "Парамарибо", 5.852, -55.2038],
  ]],
  ["gt", "Guatemala", "Гватемала", "central_america", [
    ["guatemala_city", "Guatemala City", "Гватемала", 14.6349, -90.5069],
  ]],
  ["bz", "Belize", "Белиз", "central_america", [
    ["belize_city", "Belize City", "Белиз", 17.5046, -88.1962],
  ]],
  ["hn", "Honduras", "Гондурас", "central_america", [
    ["tegucigalpa", "Tegucigalpa", "Тегусигальпа", 14.0723, -87.1921],
    ["san_pedro_sula", "San Pedro Sula", "Сан-Педро-Сула", 15.5042, -88.025],
  ]],
  ["sv", "El Salvador", "Сальвадор", "central_america", [
    ["san_salvador", "San Salvador", "Сан-Сальвадор", 13.6929, -89.2182],
  ]],
  ["ni", "Nicaragua", "Никарагуа", "central_america", [
    ["managua", "Managua", "Манагуа", 12.1149, -86.2362],
  ]],
  ["cr", "Costa Rica", "Коста-Рика", "central_america", [
    ["san_jose", "San Jose", "Сан-Хосе", 9.9281, -84.0907],
  ]],
  ["pa", "Panama", "Панама", "central_america", [
    ["panama_city", "Panama City", "Панама", 8.9824, -79.5199],
  ]],
  ["cu", "Cuba", "Куба", "caribbean", [
    ["havana", "Havana", "Гавана", 23.1136, -82.3666],
  ]],
  ["jm", "Jamaica", "Ямайка", "caribbean", [
    ["kingston", "Kingston", "Кингстон", 17.997, -76.7936],
  ]],
  ["ht", "Haiti", "Гаити", "caribbean", [
    ["port_au_prince", "Port-au-Prince", "Порт-о-Пренс", 18.5944, -72.3074],
  ]],
  ["do", "Dominican Republic", "Доминиканская Республика", "caribbean", [
    ["santo_domingo", "Santo Domingo", "Санто-Доминго", 18.4861, -69.9312],
  ]],
  ["tt", "Trinidad and Tobago", "Тринидад и Тобаго", "caribbean", [
    ["port_of_spain", "Port of Spain", "Порт-оф-Спейн", 10.6918, -61.2225],
  ]],
  ["bb", "Barbados", "Барбадос", "caribbean", [
    ["bridgetown", "Bridgetown", "Бриджтаун", 13.0975, -59.6167],
  ]],
  ["bs", "Bahamas", "Багамы", "caribbean", [
    ["nassau", "Nassau", "Нассау", 25.0443, -77.3504],
  ]],
];

function buildGeo() {
  const countries = [];
  const cities = [];
  for (const [countryId, nameEn, nameRu, region, cityList] of RAW) {
    countries.push({ id: countryId, nameEn, nameRu, nameTg: nameEn, region });
    for (const [slug, cityEn, cityRu, lat, lng] of cityList) {
      cities.push({
        id: `${countryId}_${slug}`,
        countryId,
        nameEn: cityEn,
        nameRu: cityRu,
        nameTg: cityEn,
        lat,
        lng,
      });
    }
  }
  return { countries, cities };
}

const built = buildGeo();

const out = `/** Europe & Americas — countries and major cities. */

export type Region = "europe" | "north_america" | "central_america" | "caribbean" | "south_america";

export type Country = {
  id: string;
  nameEn: string;
  nameRu: string;
  nameTg: string;
  region: Region;
};

export type City = {
  id: string;
  countryId: string;
  nameEn: string;
  nameRu: string;
  nameTg: string;
  lat: number;
  lng: number;
};

type RawCity = readonly [slug: string, en: string, ru: string, lat: number, lng: number];
type RawCountry = readonly [id: string, en: string, ru: string, region: Region, cities: readonly RawCity[]];

const RAW: RawCountry[] = ${JSON.stringify(RAW, null, 2)};

function buildGeo() {
  const countries: Country[] = [];
  const cities: City[] = [];
  for (const [countryId, nameEn, nameRu, region, cityList] of RAW) {
    countries.push({ id: countryId, nameEn, nameRu, nameTg: nameEn, region });
    for (const [slug, cityEn, cityRu, lat, lng] of cityList) {
      cities.push({
        id: \`\${countryId}_\${slug}\`,
        countryId,
        nameEn: cityEn,
        nameRu: cityRu,
        nameTg: cityEn,
        lat,
        lng,
      });
    }
  }
  return { countries, cities };
}

const built = buildGeo();
export const COUNTRIES = built.countries;
export const CITIES = built.cities;
export const DEFAULT_COUNTRY_ID = "us";
export const DEFAULT_CITY_ID = "us_new_york";

export type CountryId = (typeof COUNTRIES)[number]["id"];
export type CityId = (typeof CITIES)[number]["id"];
`;

fs.writeFileSync("lib/dispatch/geo-data.ts", out);
console.log(`Wrote ${built.countries.length} countries, ${built.cities.length} cities`);
