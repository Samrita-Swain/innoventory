// Global Location Data - Part 1: A-C Countries
// This file contains comprehensive global location data for cascading dropdowns

export const globalLocationData: Record<string, Record<string, string[]>> = {
  'Afghanistan': {
    'Kabul': ['Kabul', 'Paghman', 'Chahar Asyab', 'Deh Sabz', 'Farza'],
    'Herat': ['Herat', 'Guzara', 'Injil', 'Kushk', 'Kohsan'],
    'Kandahar': ['Kandahar', 'Daman', 'Spin Boldak', 'Arghistan', 'Maywand'],
    'Balkh': ['Mazar-i-Sharif', 'Balkh', 'Hairatan', 'Dehdadi', 'Nahri Shahi']
  },
  'Albania': {
    'Tirana': ['Tirana', 'Durrës', 'Kamëz', 'Fier', 'Vlorë'],
    'Shkodër': ['Shkodër', 'Pukë', 'Malësi e Madhe', 'Vau i Dejës', 'Fushë-Arrëz'],
    'Elbasan': ['Elbasan', 'Peqin', 'Gramsh', 'Cërrik', 'Belsh'],
    'Vlorë': ['Vlorë', 'Sarandë', 'Delvinë', 'Himarë', 'Konispol']
  },
  'Algeria': {
    'Algiers': ['Algiers', 'Bab Ezzouar', 'Dar El Beïda', 'Draria', 'Zeralda'],
    'Oran': ['Oran', 'Bir El Djir', 'Es Senia', 'Gdyel', 'Hassi Bounif'],
    'Constantine': ['Constantine', 'El Khroub', 'Ain Smara', 'Didouche Mourad', 'Hamma Bouziane'],
    'Annaba': ['Annaba', 'El Hadjar', 'Sidi Amar', 'Berrahal', 'El Bouni']
  },
  'Argentina': {
    'Buenos Aires': ['Buenos Aires', 'La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil'],
    'Córdoba': ['Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María', 'San Francisco'],
    'Santa Fe': ['Rosario', 'Santa Fe', 'Rafaela', 'Venado Tuerto', 'Reconquista'],
    'Mendoza': ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Maipú', 'Luján de Cuyo']
  },
  'Armenia': {
    'Yerevan': ['Yerevan', 'Abovyan', 'Kapan', 'Vanadzor', 'Gyumri'],
    'Shirak': ['Gyumri', 'Artik', 'Maralik', 'Akhuryan', 'Ashotsk'],
    'Lori': ['Vanadzor', 'Alaverdi', 'Stepanavan', 'Spitak', 'Tashir'],
    'Kotayk': ['Abovyan', 'Hrazdan', 'Charentsavan', 'Yeghvard', 'Nor Hachn']
  },
  'Australia': {
    'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Maitland', 'Albury'],
    'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton'],
    'Queensland': ['Brisbane', 'Gold Coast', 'Townsville', 'Cairns', 'Toowoomba'],
    'Western Australia': ['Perth', 'Fremantle', 'Bunbury', 'Geraldton', 'Kalgoorlie'],
    'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge', 'Port Augusta'],
    'Tasmania': ['Hobart', 'Launceston', 'Devonport', 'Burnie', 'Ulverstone'],
    'Northern Territory': ['Darwin', 'Alice Springs', 'Palmerston', 'Katherine', 'Nhulunbuy'],
    'Australian Capital Territory': ['Canberra', 'Gungahlin', 'Tuggeranong', 'Weston Creek', 'Belconnen']
  },
  'Austria': {
    'Vienna': ['Vienna', 'Schwechat', 'Klosterneuburg', 'Baden', 'Mödling'],
    'Salzburg': ['Salzburg', 'Hallein', 'Saalfelden', 'Zell am See', 'St. Johann im Pongau'],
    'Tyrol': ['Innsbruck', 'Kufstein', 'Wörgl', 'Schwaz', 'Hall in Tirol'],
    'Upper Austria': ['Linz', 'Wels', 'Steyr', 'Leonding', 'Traun']
  },
  'Azerbaijan': {
    'Baku': ['Baku', 'Sumqayıt', 'Khirdalan', 'Bakıxanov', 'Sabunchu'],
    'Ganja': ['Ganja', 'Goygol', 'Dashkasan', 'Gadabay', 'Shamkir'],
    'Lankaran': ['Lankaran', 'Astara', 'Lerik', 'Masalli', 'Yardimli'],
    'Shaki': ['Shaki', 'Qax', 'Oghuz', 'Zagatala', 'Balakan']
  },
  'Bahrain': {
    'Capital': ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'A\'ali'],
    'Muharraq': ['Muharraq', 'Dair', 'Galali', 'Hidd', 'Qalali'],
    'Northern': ['Budaiya', 'Janabiyah', 'Tubli', 'Bani Jamra', 'Diraz'],
    'Southern': ['Isa Town', 'Zallaq', 'Askar', 'Jurdab', 'Awali']
  },
  'Bangladesh': {
    'Dhaka': ['Dhaka', 'Gazipur', 'Narayanganj', 'Savar', 'Tongi'],
    'Chittagong': ['Chittagong', 'Cox\'s Bazar', 'Comilla', 'Brahmanbaria', 'Chandpur'],
    'Rajshahi': ['Rajshahi', 'Bogra', 'Pabna', 'Sirajganj', 'Natore'],
    'Khulna': ['Khulna', 'Jessore', 'Kushtia', 'Satkhira', 'Narail'],
    'Sylhet': ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj', 'Barlekha'],
    'Barisal': ['Barisal', 'Patuakhali', 'Bhola', 'Pirojpur', 'Jhalokati'],
    'Rangpur': ['Rangpur', 'Dinajpur', 'Thakurgaon', 'Panchagarh', 'Nilphamari'],
    'Mymensingh': ['Mymensingh', 'Jamalpur', 'Sherpur', 'Netrakona', 'Kishoreganj']
  },
  'Belarus': {
    'Minsk': ['Minsk', 'Dzerzhinsk', 'Molodechno', 'Borisov', 'Soligorsk'],
    'Gomel': ['Gomel', 'Mozyr', 'Zhlobin', 'Svetlogorsk', 'Rechitsa'],
    'Mogilev': ['Mogilev', 'Bobruisk', 'Orsha', 'Krichev', 'Osipovichi'],
    'Vitebsk': ['Vitebsk', 'Orsha', 'Novopolotsk', 'Polotsk', 'Glubokoe']
  },
  'Belgium': {
    'Brussels': ['Brussels', 'Schaerbeek', 'Anderlecht', 'Molenbeek-Saint-Jean', 'Ixelles'],
    'Antwerp': ['Antwerp', 'Mechelen', 'Turnhout', 'Mol', 'Herentals'],
    'East Flanders': ['Ghent', 'Aalst', 'Sint-Niklaas', 'Dendermonde', 'Eeklo'],
    'West Flanders': ['Bruges', 'Ostend', 'Kortrijk', 'Roeselare', 'Ypres'],
    'Flemish Brabant': ['Leuven', 'Vilvoorde', 'Halle', 'Aarschot', 'Tienen'],
    'Walloon Brabant': ['Wavre', 'Braine-l\'Alleud', 'Waterloo', 'Ottignies', 'Nivelles'],
    'Hainaut': ['Charleroi', 'Mons', 'La Louvière', 'Tournai', 'Mouscron'],
    'Liège': ['Liège', 'Seraing', 'Verviers', 'Herstal', 'Huy'],
    'Luxembourg': ['Arlon', 'Bastogne', 'Marche-en-Famenne', 'Virton', 'Saint-Hubert'],
    'Namur': ['Namur', 'Gembloux', 'Dinant', 'Ciney', 'Andenne']
  },
  'Brazil': {
    'São Paulo': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André'],
    'Rio de Janeiro': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói'],
    'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'],
    'Bahia': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna'],
    'Paraná': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
    'Rio Grande do Sul': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria']
  },
  'Bulgaria': {
    'Sofia': ['Sofia', 'Pernik', 'Blagoevgrad', 'Kyustendil', 'Dupnitsa'],
    'Plovdiv': ['Plovdiv', 'Asenovgrad', 'Karlovo', 'Parvomay', 'Rakovski'],
    'Varna': ['Varna', 'Devnya', 'Provadiya', 'Suvorovo', 'Beloslav'],
    'Burgas': ['Burgas', 'Sozopol', 'Nesebar', 'Pomorie', 'Aytos']
  },
  'Cambodia': {
    'Phnom Penh': ['Phnom Penh', 'Ta Khmau', 'Chbar Mon', 'Prek Pnov', 'Sen Sok'],
    'Siem Reap': ['Siem Reap', 'Angkor Thom', 'Banteay Srei', 'Prasat Bakong', 'Roluos'],
    'Battambang': ['Battambang', 'Banan', 'Thma Koul', 'Sangkae', 'Ratanak Mondul'],
    'Sihanoukville': ['Sihanoukville', 'Prey Nob', 'Stueng Hav', 'Kampong Seila', 'Koh Kong']
  },
  'Canada': {
    'Ontario': ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Kitchener'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond'],
    'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat'],
    'Manitoba': ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie'],
    'Saskatchewan': ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current'],
    'Nova Scotia': ['Halifax', 'Sydney', 'Dartmouth', 'Truro', 'New Glasgow'],
    'New Brunswick': ['Saint John', 'Moncton', 'Fredericton', 'Dieppe', 'Riverview'],
    'Newfoundland and Labrador': ['St. John\'s', 'Mount Pearl', 'Corner Brook', 'Conception Bay South', 'Grand Falls-Windsor'],
    'Prince Edward Island': ['Charlottetown', 'Summerside', 'Stratford', 'Cornwall', 'Montague'],
    'Northwest Territories': ['Yellowknife', 'Hay River', 'Inuvik', 'Fort Smith', 'Behchokǫ̀'],
    'Yukon': ['Whitehorse', 'Dawson City', 'Watson Lake', 'Haines Junction', 'Mayo'],
    'Nunavut': ['Iqaluit', 'Rankin Inlet', 'Arviat', 'Baker Lake', 'Igloolik']
  },
  'Chile': {
    'Santiago': ['Santiago', 'Puente Alto', 'Maipú', 'Las Condes', 'La Florida'],
    'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Villa Alemana', 'Quilpué', 'San Antonio'],
    'Biobío': ['Concepción', 'Talcahuano', 'Chillán', 'Los Ángeles', 'Coronel'],
    'Araucanía': ['Temuco', 'Villarrica', 'Pucón', 'Angol', 'Nueva Imperial']
  },
  'China': {
    'Beijing': ['Beijing', 'Chaoyang', 'Haidian', 'Fengtai', 'Shijingshan'],
    'Shanghai': ['Shanghai', 'Pudong', 'Huangpu', 'Xuhui', 'Changning'],
    'Guangdong': ['Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan', 'Zhongshan'],
    'Jiangsu': ['Nanjing', 'Suzhou', 'Wuxi', 'Changzhou', 'Nantong'],
    'Zhejiang': ['Hangzhou', 'Ningbo', 'Wenzhou', 'Jiaxing', 'Huzhou'],
    'Shandong': ['Jinan', 'Qingdao', 'Yantai', 'Weifang', 'Zibo'],
    'Henan': ['Zhengzhou', 'Luoyang', 'Xinxiang', 'Anyang', 'Kaifeng'],
    'Sichuan': ['Chengdu', 'Mianyang', 'Deyang', 'Nanchong', 'Yibin'],
    'Hubei': ['Wuhan', 'Yichang', 'Xiangyang', 'Jingzhou', 'Huangshi'],
    'Hunan': ['Changsha', 'Zhuzhou', 'Xiangtan', 'Hengyang', 'Shaoyang']
  },
  'Colombia': {
    'Bogotá': ['Bogotá', 'Soacha', 'Chía', 'Zipaquirá', 'Facatativá'],
    'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó'],
    'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago'],
    'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanagrande', 'Baranoa']
  },
  'Croatia': {
    'Zagreb': ['Zagreb', 'Sesvete', 'Velika Gorica', 'Samobor', 'Zaprešić'],
    'Split-Dalmatia': ['Split', 'Kaštela', 'Solin', 'Trogir', 'Omiš'],
    'Primorje-Gorski Kotar': ['Rijeka', 'Pula', 'Opatija', 'Krk', 'Crikvenica'],
    'Osijek-Baranja': ['Osijek', 'Đakovo', 'Belišće', 'Valpovo', 'Donji Miholjac']
  },
  'Czech Republic': {
    'Prague': ['Prague', 'Kladno', 'Beroun', 'Mělník', 'Kolín'],
    'South Moravian': ['Brno', 'Znojmo', 'Hodonín', 'Břeclav', 'Vyškov'],
    'Moravian-Silesian': ['Ostrava', 'Karviná', 'Frýdek-Místek', 'Opava', 'Havířov'],
    'Central Bohemian': ['Mladá Boleslav', 'Příbram', 'Kutná Hora', 'Benešov', 'Rakovník']
  },
  'Morocco': {
    'Casablanca-Settat': ['Casablanca', 'Settat', 'Berrechid', 'Mohammedia', 'El Jadida'],
    'Rabat-Salé-Kénitra': ['Rabat', 'Salé', 'Kénitra', 'Khémisset', 'Sidi Kacem'],
    'Fès-Meknès': ['Fès', 'Meknès', 'Taza', 'Sefrou', 'Moulay Yacoub'],
    'Marrakech-Safi': ['Marrakech', 'Safi', 'Essaouira', 'Kelaa des Sraghna', 'Youssoufia']
  },
  'Netherlands': {
    'North Holland': ['Amsterdam', 'Haarlem', 'Zaanstad', 'Haarlemmermeer', 'Alkmaar'],
    'South Holland': ['The Hague', 'Rotterdam', 'Leiden', 'Dordrecht', 'Zoetermeer'],
    'North Brabant': ['Eindhoven', 'Tilburg', 'Breda', 's-Hertogenbosch', 'Helmond'],
    'Utrecht': ['Utrecht', 'Amersfoort', 'Nieuwegein', 'Veenendaal', 'Zeist']
  },
  'New Zealand': {
    'Auckland': ['Auckland', 'Manukau', 'North Shore', 'Waitakere', 'Papakura'],
    'Canterbury': ['Christchurch', 'Timaru', 'Ashburton', 'Rangiora', 'Rolleston'],
    'Wellington': ['Wellington', 'Lower Hutt', 'Upper Hutt', 'Porirua', 'Kapiti Coast'],
    'Waikato': ['Hamilton', 'Tauranga', 'Rotorua', 'New Plymouth', 'Whangarei']
  },
  'Nigeria': {
    'Lagos': ['Lagos', 'Ikeja', 'Ikorodu', 'Epe', 'Badagry'],
    'Kano': ['Kano', 'Wudil', 'Gwarzo', 'Karaye', 'Rogo'],
    'Kaduna': ['Kaduna', 'Zaria', 'Kafanchan', 'Sabon Gari', 'Makarfi'],
    'Rivers': ['Port Harcourt', 'Obio-Akpor', 'Okrika', 'Eleme', 'Tai']
  },
  'Norway': {
    'Oslo': ['Oslo', 'Bærum', 'Asker', 'Lørenskog', 'Oppegård'],
    'Viken': ['Drammen', 'Fredrikstad', 'Sarpsborg', 'Moss', 'Sandefjord'],
    'Rogaland': ['Stavanger', 'Sandnes', 'Haugesund', 'Egersund', 'Bryne'],
    'Vestland': ['Bergen', 'Ålesund', 'Haugesund', 'Molde', 'Florø']
  },
  'Pakistan': {
    'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala'],
    'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah'],
    'Khyber Pakhtunkhwa': ['Peshawar', 'Mardan', 'Mingora', 'Kohat', 'Dera Ismail Khan'],
    'Balochistan': ['Quetta', 'Turbat', 'Khuzdar', 'Hub', 'Chaman']
  },
  'Philippines': {
    'Metro Manila': ['Manila', 'Quezon City', 'Caloocan', 'Las Piñas', 'Makati'],
    'Calabarzon': ['Antipolo', 'Dasmarinas', 'Bacoor', 'Calamba', 'Imus'],
    'Central Luzon': ['Angeles', 'Tarlac', 'Cabanatuan', 'San Fernando', 'Malolos'],
    'Western Visayas': ['Iloilo City', 'Bacolod', 'Roxas', 'Kalibo', 'San Carlos']
  },
  'Poland': {
    'Masovian': ['Warsaw', 'Radom', 'Płock', 'Siedlce', 'Ostrołęka'],
    'Silesian': ['Katowice', 'Częstochowa', 'Sosnowiec', 'Gliwice', 'Zabrze'],
    'Lesser Poland': ['Kraków', 'Tarnów', 'Nowy Sącz', 'Oświęcim', 'Chrzanów'],
    'Greater Poland': ['Poznań', 'Kalisz', 'Konin', 'Piła', 'Ostrów Wielkopolski']
  },
  'Portugal': {
    'Lisbon': ['Lisbon', 'Sintra', 'Cascais', 'Loures', 'Amadora'],
    'Porto': ['Porto', 'Vila Nova de Gaia', 'Matosinhos', 'Gondomar', 'Maia'],
    'Braga': ['Braga', 'Guimarães', 'Barcelos', 'Famalicão', 'Esposende'],
    'Aveiro': ['Aveiro', 'Ílhavo', 'Ovar', 'Santa Maria da Feira', 'Oliveira de Azeméis']
  },
  'Russia': {
    'Moscow': ['Moscow', 'Balashikha', 'Khimki', 'Podolsk', 'Korolev'],
    'Saint Petersburg': ['Saint Petersburg', 'Gatchina', 'Vyborg', 'Kolpino', 'Pushkin'],
    'Moscow Oblast': ['Balashikha', 'Khimki', 'Podolsk', 'Korolev', 'Mytishchi'],
    'Krasnodar Krai': ['Krasnodar', 'Sochi', 'Novorossiysk', 'Armavir', 'Maykop']
  },
  'Saudi Arabia': {
    'Riyadh': ['Riyadh', 'Al Kharj', 'Dawadmi', 'Al Majmaah', 'Al Quwayiyah'],
    'Makkah': ['Mecca', 'Jeddah', 'Taif', 'Rabigh', 'Khulais'],
    'Eastern Province': ['Dammam', 'Al Khobar', 'Dhahran', 'Jubail', 'Al Qatif'],
    'Medina': ['Medina', 'Yanbu', 'Al Ula', 'Badr', 'Khaybar']
  },
  'Singapore': {
    'Central Region': ['Singapore', 'Orchard', 'Marina Bay', 'Chinatown', 'Little India'],
    'East Region': ['Bedok', 'Tampines', 'Pasir Ris', 'Changi', 'Simei'],
    'North Region': ['Woodlands', 'Yishun', 'Sembawang', 'Admiralty', 'Marsiling'],
    'West Region': ['Jurong East', 'Jurong West', 'Choa Chu Kang', 'Bukit Batok', 'Clementi']
  },
  'South Africa': {
    'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto', 'Benoni', 'Tembisa'],
    'Western Cape': ['Cape Town', 'Bellville', 'Mitchells Plain', 'Khayelitsha', 'Somerset West'],
    'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Pinetown', 'Chatsworth', 'Umlazi'],
    'Eastern Cape': ['Port Elizabeth', 'East London', 'Uitenhage', 'Mdantsane', 'Zwelitsha']
  },
  'South Korea': {
    'Seoul': ['Seoul', 'Gangnam', 'Gangdong', 'Gangbuk', 'Gangseo'],
    'Busan': ['Busan', 'Haeundae', 'Saha', 'Buk', 'Sasang'],
    'Incheon': ['Incheon', 'Namdong', 'Bupyeong', 'Seo', 'Yeonsu'],
    'Daegu': ['Daegu', 'Suseong', 'Dalseo', 'Buk', 'Dong']
  },
  'Spain': {
    'Madrid': ['Madrid', 'Móstoles', 'Alcalá de Henares', 'Fuenlabrada', 'Leganés'],
    'Catalonia': ['Barcelona', 'Hospitalet de Llobregat', 'Badalona', 'Terrassa', 'Sabadell'],
    'Andalusia': ['Seville', 'Málaga', 'Córdoba', 'Granada', 'Jerez de la Frontera'],
    'Valencia': ['Valencia', 'Alicante', 'Elche', 'Castellón de la Plana', 'Torrent']
  },
  'Sweden': {
    'Stockholm': ['Stockholm', 'Huddinge', 'Järfälla', 'Botkyrka', 'Haninge'],
    'Västra Götaland': ['Gothenburg', 'Borås', 'Mölndal', 'Trollhättan', 'Uddevalla'],
    'Skåne': ['Malmö', 'Helsingborg', 'Lund', 'Kristianstad', 'Landskrona'],
    'Uppsala': ['Uppsala', 'Enköping', 'Östhammar', 'Håbo', 'Knivsta']
  },
  'Switzerland': {
    'Zurich': ['Zurich', 'Winterthur', 'Uster', 'Dübendorf', 'Dietikon'],
    'Bern': ['Bern', 'Biel/Bienne', 'Thun', 'Köniz', 'Steffisburg'],
    'Vaud': ['Lausanne', 'Yverdon-les-Bains', 'Montreux', 'Renens', 'Nyon'],
    'Geneva': ['Geneva', 'Vernier', 'Lancy', 'Meyrin', 'Carouge']
  },
  'Thailand': {
    'Bangkok': ['Bangkok', 'Nonthaburi', 'Pak Kret', 'Hat Yai', 'Chiang Mai'],
    'Central Thailand': ['Nonthaburi', 'Samut Prakan', 'Pathum Thani', 'Chon Buri', 'Rayong'],
    'Northern Thailand': ['Chiang Mai', 'Chiang Rai', 'Lampang', 'Phitsanulok', 'Sukhothai'],
    'Southern Thailand': ['Hat Yai', 'Surat Thani', 'Phuket', 'Nakhon Si Thammarat', 'Songkhla']
  },
  'Turkey': {
    'Istanbul': ['Istanbul', 'Beyoğlu', 'Kadıköy', 'Üsküdar', 'Şişli'],
    'Ankara': ['Ankara', 'Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak'],
    'İzmir': ['İzmir', 'Konak', 'Bornova', 'Buca', 'Karşıyaka'],
    'Bursa': ['Bursa', 'Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya']
  },
  'Ukraine': {
    'Kyiv': ['Kyiv', 'Brovary', 'Bila Tserkva', 'Boryspil', 'Fastiv'],
    'Kharkiv': ['Kharkiv', 'Chuhuiv', 'Izyum', 'Kupiansk', 'Lozova'],
    'Odesa': ['Odesa', 'Chornomorsk', 'Yuzhnoukrainsk', 'Izmail', 'Bilhorod-Dnistrovskyi'],
    'Dnipropetrovsk': ['Dnipro', 'Kryvyi Rih', 'Kamianske', 'Nikopol', 'Pavlohrad']
  },
  'United Arab Emirates': {
    'Dubai': ['Dubai', 'Deira', 'Bur Dubai', 'Jumeirah', 'Downtown Dubai'],
    'Abu Dhabi': ['Abu Dhabi', 'Al Ain', 'Zayed City', 'Khalifa City', 'Ruwais'],
    'Sharjah': ['Sharjah', 'Kalba', 'Khor Fakkan', 'Dibba Al-Hisn', 'Mleiha'],
    'Ajman': ['Ajman', 'Masfout', 'Manama', 'Al Tallah', 'Al Jurf']
  },
  'United Kingdom': {
    'England': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool'],
    'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Stirling'],
    'Wales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry'],
    'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Newtownabbey', 'Bangor']
  },
  'United States': {
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
    'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
    'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee'],
    'New York': ['New York', 'Buffalo', 'Rochester', 'Syracuse', 'Albany'],
    'Illinois': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville']
  },
  'Vietnam': {
    'Ho Chi Minh City': ['Ho Chi Minh City', 'Thu Duc', 'Bien Hoa', 'Vung Tau', 'Tay Ninh'],
    'Hanoi': ['Hanoi', 'Hai Phong', 'Nam Dinh', 'Thai Binh', 'Ninh Binh'],
    'Da Nang': ['Da Nang', 'Hoi An', 'Tam Ky', 'Quang Ngai', 'Kon Tum'],
    'Can Tho': ['Can Tho', 'Rach Gia', 'Ca Mau', 'Soc Trang', 'Bac Lieu']
  }
}

export default globalLocationData
