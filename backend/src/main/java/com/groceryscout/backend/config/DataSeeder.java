package com.groceryscout.backend.config;

import com.groceryscout.backend.entity.Product;
import com.groceryscout.backend.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

        private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
        private final ProductRepository productRepository;

        private final com.groceryscout.backend.repository.UserRepository userRepository;
        private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

        public DataSeeder(ProductRepository productRepository,
                        com.groceryscout.backend.repository.UserRepository userRepository,
                        org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
                this.productRepository = productRepository;
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        public void run(String... args) {
                seedUsers();
                seedProducts();
        }

        private void seedUsers() {
                seedUser("admin@groceryscout.com", "admin123", com.groceryscout.backend.entity.Role.ADMIN,
                                "Default Admin");
                seedUser("manager@groceryscout.com", "manager123", com.groceryscout.backend.entity.Role.MANAGER,
                                "Default Manager");
                seedUser("user@test.com", "user123", com.groceryscout.backend.entity.Role.CUSTOMER, "Default Customer");
        }

        private void seedUser(String email, String password, com.groceryscout.backend.entity.Role role,
                        String profileData) {
                com.groceryscout.backend.entity.User user = userRepository.findByEmail(email)
                                .orElse(new com.groceryscout.backend.entity.User());
                if (user.getId() == null) {
                        user.setEmail(email);
                        log.info("Creating user: {}", email);
                } else {
                        log.info("Updating existing user: {}", email);
                }
                user.setPasswordHash(passwordEncoder.encode(password));
                user.setRole(role);
                user.setProfileData(profileData);
                userRepository.save(user);
        }

        private void seedProducts() {
                if (productRepository.count() > 0) {
                        log.info("Products already seeded ({} found), skipping.", productRepository.count());
                        return;
                }

                log.info("Seeding product data...");

                List<Product> products = List.of(
                                product("Fresh Tomatoes", "Fruits & Vegetables", 25.00, "kg",
                                                "https://rukminim2.flixcart.com/image/850/1000/xif0q/plant-seed/l/l/i/50-f1-hybrid-tomato-sachriya-haritkarni-original-imaggmqgcvjja3qt.jpeg?q=90&crop=false",
                                                100, 1000),
                                product("Onions", "Fruits & Vegetables", 20.00, "kg",
                                                "https://5.imimg.com/data5/ANDROID/Default/2023/12/372380354/GT/DS/XN/203110273/prod-20231228-1957273905166265564667309-jpg-250x250.jpg",
                                                150, 1000),
                                product("Potatoes", "Fruits & Vegetables", 18.00, "kg",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/3/498183581/ZF/XZ/EM/9687089/sugar-free-potato-250x250.jpg",
                                                120, 1000),
                                product("Amul Butter", "Dairy & Eggs", 48.00, "100g",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/3/398970717/CG/RZ/FY/78034159/green-cotton-fabric-250x250.jpg",
                                                80, 100),
                                product("Paneer", "Dairy & Eggs", 70.00, "200g",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/11/465083665/LD/LU/OX/114364635/full-cream-paneer-250x250.jpg",
                                                60, 200),
                                product("Amul Milk", "Dairy & Eggs", 30.00, "0.5L",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/10/455616872/LH/UI/YD/40096212/amul-milk-250x250.png",
                                                200, 500),
                                product("Organic Turmeric Powder", "Spices & Masalas", 35.00, "100g",
                                                "https://5.imimg.com/data5/SELLER/Default/2023/9/342127916/CO/MC/ND/9013366/turmeric-powder-organic-250x250.jpeg",
                                                90, 100),
                                product("Red Chilli Powder", "Spices & Masalas", 40.00, "100g",
                                                "http://5.imimg.com/data5/SELLER/Default/2023/9/342152106/PX/ZN/TN/9013366/kashmiri-chilli-powder-1000x1000.jpeg",
                                                85, 100),
                                product("Garam Masala", "Spices & Masalas", 50.00, "100g",
                                                "http://5.imimg.com/data5/UM/EL/HM/SELLER-1998375/garam-masala-500x500.jpg",
                                                70, 100),
                                product("Basmati Rice Packet", "Rice & Grains", 90.00, "kg",
                                                "https://5.imimg.com/data5/ANDROID/Default/2025/4/500864459/JZ/WH/NA/5667603/product-jpeg-250x250.jpg",
                                                100, 1000),
                                product("Toor Dal", "Rice & Grains", 85.00, "kg",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/2/485825768/CJ/IB/KY/189429300/toor-dal-third-quality-250x250.jpg",
                                                99, 1000),
                                product("Wheat Flour Packet", "Rice & Grains", 35.00, "kg",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/4/503277453/TE/ER/DB/144175282/aashirvaad-wheat-flour-250x250.jpg",
                                                102, 1000),
                                product("Lays Chips", "Snacks", 20.00, "pack",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/12/476544500/VD/KS/YP/236698204/lays-hot-sweet-250x250.jpg",
                                                150, 50),
                                product("Hide & Seek", "Snacks", 30.00, "pack",
                                                "https://5.imimg.com/data5/ANDROID/Default/2025/1/484339569/VQ/TA/MP/10491252/product-jpeg-250x250.jpg",
                                                130, 100),
                                product("Aloo Bhujia", "Snacks", 45.00, "200g",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/4/503185329/RK/XJ/QD/23743223/aloo-bhujia-namkeen-250x250.jpg",
                                                100, 200),
                                product("Cream", "Dairy & Eggs", 55.00, "200ml",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/5/422981260/KR/GO/QC/114700609/454-250x250.jpeg",
                                                70, 200),
                                product("Chicken Breast", "Meat & Seafood", 120.00, "500g",
                                                "https://5.imimg.com/data5/SELLER/Default/2022/5/HU/KL/LH/129229669/smoked-chicken-breast-nature-s-soul-500gm-250x250.jpg",
                                                50, 500),
                                product("Tomato Puree", "Fruits & Vegetables", 35.00, "200g",
                                                "https://5.imimg.com/data5/SELLER/Default/2022/11/OS/QD/LC/4856313/kissan-tomato-puree-1kg-2-250x250.jpg",
                                                80, 200),
                                product("Garlic Paste", "Spices & Masalas", 30.00, "100g",
                                                "https://5.imimg.com/data5/SELLER/PDFImage/2024/4/411635140/UB/MP/BX/142731192/garlic-paste-250x250.png",
                                                75, 100),
                                product("Ginger Paste", "Spices & Masalas", 30.00, "100g",
                                                "https://5.imimg.com/data5/ANDROID/Default/2023/10/355294824/UO/XE/JW/23057836/product-jpeg-250x250.jpeg",
                                                75, 100),
                                product("Bell Peppers", "Fruits & Vegetables", 45.00, "250g",
                                                "https://5.imimg.com/data5/SELLER/Default/2023/11/363575002/WL/YJ/WN/198633145/70-250x250.png",
                                                60, 250),
                                product("Carrots", "Fruits & Vegetables", 25.00, "500g",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/2/389034571/MY/RR/UQ/123355379/carrot-250x250.jpg",
                                                90, 500),
                                product("Cucumber", "Fruits & Vegetables", 15.00, "piece",
                                                "https://5.imimg.com/data5/SELLER/Default/2022/9/TJ/EE/QO/159921501/cocumber-250x250.jpg",
                                                100, 200),
                                product("Cauliflower", "Fruits & Vegetables", 30.00, "head",
                                                "https://5.imimg.com/data5/SELLER/Default/2022/6/HS/RP/UA/83716376/1-250x250.png",
                                                50, 600),
                                product("Broccoli", "Fruits & Vegetables", 40.00, "head",
                                                "https://5.imimg.com/data5/ANDROID/Default/2020/9/HY/WW/LJ/79520663/product-jpeg-250x250.jpg",
                                                40, 400),
                                product("Spinach", "Fruits & Vegetables", 20.00, "bunch",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/10/460949905/TS/CU/LH/65797831/fresh-spinach-leaves-250x250.jpg",
                                                80, 250),
                                product("Coriander", "Fruits & Vegetables", 10.00, "bunch",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/3/494815116/LS/NY/RK/124394901/fresh-green-coriander-leaves-250x250.jpeg",
                                                100, 100),
                                product("Mint", "Fruits & Vegetables", 10.00, "bunch",
                                                "https://3.imimg.com/data3/UY/AL/GLADMIN-9150/herb-leaves-125x125.jpg",
                                                90, 50),
                                product("Green Chillies", "Fruits & Vegetables", 8.00, "50g",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/3/493841034/WB/EC/BE/96606494/fresh-green-chilli-250x250.png",
                                                120, 50),
                                product("Lemons", "Fruits & Vegetables", 15.00, "500g",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/8/441636265/EY/AM/GF/226952059/lemon-250x250.jpg",
                                                100, 500),
                                product("Apples", "Fruits & Vegetables", 120.00, "kg",
                                                "https://5.imimg.com/data5/SELLER/Default/2023/1/AS/FO/QN/45117192/fresh-organic-apple-250x250.jpg",
                                                70, 1000),
                                product("Bananas", "Fruits & Vegetables", 40.00, "dozen",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/3/495979513/NR/EB/JV/92589310/fresh-banana-250x250.jpg",
                                                150, 1200),
                                product("Mangoes", "Fruits & Vegetables", 150.00, "kg",
                                                "https://5.imimg.com/data5/SELLER/Default/2022/11/ZN/KO/SM/135721374/whatsapp-image-2022-11-10-at-12-14-11-pm-250x250.jpeg",
                                                40, 1000),
                                product("Grapes", "Fruits & Vegetables", 75.00, "500g",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/1/480637810/OK/PE/PG/157753997/capsule-grapes-250x250.jpg",
                                                60, 500),
                                product("Oranges", "Fruits & Vegetables", 60.00, "kg",
                                                "https://5.imimg.com/data5/SELLER/Default/2022/9/OH/QA/NX/45117192/fresh-nagpur-orange-250x250.png",
                                                80, 1000),
                                product("Strawberries", "Fruits & Vegetables", 80.00, "250g",
                                                "https://5.imimg.com/data5/SELLER/Default/2023/12/369688610/JT/ML/EH/204293324/frozen-strawberry-fruit-250x250.jpg",
                                                45, 250),
                                product("Watermelon", "Fruits & Vegetables", 70.00, "piece",
                                                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD0qedAEEvk9S0-G_e3ur6BXTD_5k7UJ4Cog&usqp=CAU",
                                                30, 2500),
                                product("Eggs", "Dairy & Eggs", 60.00, "dozen",
                                                "https://5.imimg.com/data5/ANDROID/Default/2025/2/486583821/NX/DM/HU/62611233/product-jpeg-250x250.jpg",
                                                200, 600),
                                product("Cheese Slices", "Dairy & Eggs", 80.00, "pack",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/3/492987850/MU/FK/RQ/25273339/dynamix-cheese-slices-yellow-765-gm-250x250.jpg",
                                                60, 200),
                                product("Mozzarella Cheese", "Dairy & Eggs", 180.00, "200g",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/2/489587763/LB/LC/TU/192429941/077b0992-bca9-433d-be49-7c70862f2991-250x250.jpeg",
                                                40, 200),
                                product("Cheddar Cheese", "Dairy & Eggs", 190.00, "200g",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/2/489587763/LB/LC/TU/192429941/077b0992-bca9-433d-be49-7c70862f2991-250x250.jpeg",
                                                40, 200),
                                product("Yogurt", "Dairy & Eggs", 35.00, "400g",
                                                "https://2.imimg.com/data2/NA/PX/MY-3216051/dhahi-250x250.jpg", 100,
                                                400),
                                product("Butter", "Dairy & Eggs", 50.00, "100g",
                                                "https://5.imimg.com/data5/SELLER/Default/2023/6/316688705/PN/SE/NW/11017095/white-mist-cow-butter-500g-250x250.jpg",
                                                80, 100),
                                product("Ghee", "Dairy & Eggs", 350.00, "500g",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/4/501590982/EH/TA/VT/224706345/organic-cow-ghee-250x250.jpg",
                                                50, 500),
                                product("Cumin Seeds", "Spices & Masalas", 45.00, "100g",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/8/446069630/DH/TK/CI/89967469/cumin-seed-jeera-250x250.png",
                                                80, 100),
                                product("Coriander Seeds", "Spices & Masalas", 40.00, "100g",
                                                "https://5.imimg.com/data5/SELLER/Default/2023/4/297112970/TI/NZ/TT/7904694/coriander-200g-front-250x250.png",
                                                75, 100),
                                product("Mustard Seeds", "Spices & Masalas", 35.00, "100g",
                                                "https://5.imimg.com/data5/SELLER/Default/2022/1/JK/BJ/EI/8491760/mustard-seeds-250x250.jpg",
                                                90, 100),
                                product("Fenugreek Seeds", "Spices & Masalas", 30.00, "100g",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/3/495211772/FR/WZ/KE/160743515/dried-fenugreek-seeds-250x250.jpeg",
                                                70, 100),
                                product("Cinnamon Sticks", "Spices & Masalas", 50.00, "50g",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/1/379576005/PT/HX/YC/5751538/cinnamon-stick-250x250.jpg",
                                                60, 50),
                                product("Cardamom", "Spices & Masalas", 95.00, "50g",
                                                "http://5.imimg.com/data5/SELLER/Default/2023/7/325315184/WU/BL/ZQ/9320513/green-cardamom-elaichi-500x500.jpeg",
                                                50, 50),
                                product("Cloves", "Spices & Masalas", 60.00, "50g",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/12/477378642/GF/SN/MV/9518350/download-8-250x250.jpg",
                                                65, 50),
                                product("Bay Leaves", "Spices & Masalas", 25.00, "20g",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/3/493665844/MT/DM/VJ/196307877/dried-bay-leaves-250x250.jpg",
                                                80, 20),
                                product("Black Pepper", "Spices & Masalas", 70.00, "100g",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/10/457191506/AJ/FO/TI/219074586/organic-black-pepper-1-250x250.jpg",
                                                70, 100),
                                product("Kashmiri Red Chilli", "Spices & Masalas", 85.00, "100g",
                                                "https://5.imimg.com/data5/SELLER/Default/2023/3/SO/TH/ZH/119939588/7-250x250.jpg",
                                                55, 100),
                                product("Chicken Curry Cut", "Meat & Seafood", 150.00, "500g",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/2/490281262/ZC/QL/WJ/240428687/chicken-curry-cut-without-skin-250x250.jpg",
                                                45, 500),
                                product("Mutton", "Meat & Seafood", 450.00, "500g",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/1/483385201/AE/QH/CM/8793846/fresh-mutton-meat-250x250.jpg",
                                                30, 500),
                                product("Fish (Rohu)", "Meat & Seafood", 170.00, "500g",
                                                "https://5.imimg.com/data5/SELLER/Default/2020/11/BV/SA/NI/24808465/small-fish-surmai-250x250.png",
                                                35, 500),
                                product("Prawns", "Meat & Seafood", 280.00, "250g",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/3/398739696/PE/ZW/OF/162018206/8-1-hon-tiger-prawns-250x250.jpeg",
                                                25, 250),
                                product("Pomfret", "Meat & Seafood", 300.00, "piece",
                                                "https://5.imimg.com/data5/SELLER/Default/2024/10/460577542/TG/MV/YK/223117386/frozen-pomfret-fish-250x250.jpg",
                                                20, 250),
                                product("Moong Dal", "Rice & Grains", 80.00, "500g",
                                                "https://5.imimg.com/data5/SELLER/Default/2023/5/308788830/QH/VR/GV/5358436/30kg-packaging-bag-250x250.png",
                                                90, 500),
                                product("Masoor Dal", "Rice & Grains", 70.00, "500g",
                                                "https://5.imimg.com/data5/SELLER/Default/2023/8/333033913/KF/XR/OI/68421316/malka-masoor-dal-250x250.jpeg",
                                                85, 500),
                                product("Urad Dal", "Rice & Grains", 80.00, "500g",
                                                "https://5.imimg.com/data5/ANDROID/Default/2025/2/492210323/SZ/EH/AW/122101530/product-jpeg-250x250.jpg",
                                                75, 500),
                                product("Chana Dal", "Rice & Grains", 75.00, "500g",
                                                "https://5.imimg.com/data5/SELLER/Default/2025/3/493442191/TH/SR/AG/48368029/yellow-chana-dal-250x250.jpg",
                                                80, 500),
                                product("Brown Rice", "Rice & Grains", 85.00, "kg",
                                                "https://5.imimg.com/data5/SELLER/Default/2023/2/NG/HY/EL/64098181/1-38--250x250.jpeg",
                                                60, 1000),
                                product("Quinoa", "Rice & Grains", 180.00, "500g",
                                                "https://5.imimg.com/data5/ANDROID/Default/2025/1/478006498/IW/NO/VH/76708793/product-jpeg-250x250.jpg",
                                                45, 500),
                                product("Oats", "Rice & Grains", 85.00, "500g",
                                                "https://5.imimg.com/data5/IOS/Default/2024/6/427565410/SG/TG/UL/57519681/product-jpeg-250x250.png",
                                                80, 500));

                productRepository.saveAll(products);
                log.info("Seeded {} products successfully.", products.size());
        }

        private Product product(String name, String category, double price, String unit, String imageUrl, int inventory,
                        int weightInGrams) {
                Product p = new Product();
                p.setName(name);
                p.setCategory(category);
                p.setPrice(BigDecimal.valueOf(price));
                p.setUnit(unit);
                p.setImageUrl(imageUrl);
                p.setInventoryCount(inventory);
                p.setWeightInGrams(weightInGrams);
                p.setIsActive(true);
                return p;
        }
}
