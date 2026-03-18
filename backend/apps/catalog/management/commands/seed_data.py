from django.core.management.base import BaseCommand

from apps.catalog.models import Category, Product


class Command(BaseCommand):
    help = "Seed the database with initial catalog data for Upstream Literacy"

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-if-exists",
            action="store_true",
            help="Skip seeding if products already exist in the database",
        )

    def handle(self, *args, **options):
        if options["skip_if_exists"] and Product.objects.exists():
            self.stdout.write(
                self.style.WARNING("Products already exist. Skipping seed.")
            )
            return

        self.stdout.write("Seeding categories...")
        categories = self._create_categories()

        self.stdout.write("Seeding products...")
        self._create_products(categories)

        self.stdout.write(self.style.SUCCESS("Seed data created successfully."))

    def _create_categories(self):
        category_data = [
            {
                "name": "Curriculum Materials",
                "slug": "curriculum-materials",
                "description": "Comprehensive literacy curriculum packages, lesson plans, and instructional frameworks for K-12 educators.",
            },
            {
                "name": "Assessment Tools",
                "slug": "assessment-tools",
                "description": "Diagnostic assessments, progress monitoring tools, and benchmark testing materials for reading and writing.",
            },
            {
                "name": "Professional Development",
                "slug": "professional-development",
                "description": "Training courses, workshops, and certification programs for literacy coaches and educators.",
            },
            {
                "name": "Classroom Resources",
                "slug": "classroom-resources",
                "description": "Hands-on materials, manipulatives, decodable readers, and supplemental resources for literacy instruction.",
            },
        ]

        categories = {}
        for data in category_data:
            cat, _ = Category.objects.get_or_create(
                slug=data["slug"],
                defaults=data,
            )
            categories[cat.slug] = cat

        return categories

    def _create_products(self, categories):
        products = [
            # Curriculum Materials
            {
                "category": categories["curriculum-materials"],
                "name": "Structured Literacy Foundations K-2 Bundle",
                "slug": "structured-literacy-foundations-k2",
                "sku": "UL-CM-001",
                "price": "249.99",
                "stock": 50,
                "featured": True,
                "description": "A comprehensive structured literacy curriculum for grades K-2 including phonemic awareness, phonics, fluency, vocabulary, and comprehension components. Aligned with the Science of Reading.",
            },
            {
                "category": categories["curriculum-materials"],
                "name": "Advanced Phonics Intervention Program",
                "slug": "advanced-phonics-intervention",
                "sku": "UL-CM-002",
                "price": "189.99",
                "stock": 35,
                "featured": False,
                "description": "Targeted phonics intervention program for students in grades 3-5 who need additional support with decoding and encoding multisyllabic words.",
            },
            {
                "category": categories["curriculum-materials"],
                "name": "Writing Workshop Complete Guide",
                "slug": "writing-workshop-complete-guide",
                "sku": "UL-CM-003",
                "price": "149.99",
                "stock": 60,
                "featured": True,
                "description": "A full-year writing workshop curriculum with mini-lessons, mentor texts, conferencing guides, and rubrics for grades 3-8.",
            },
            {
                "category": categories["curriculum-materials"],
                "name": "Morphology Matters Vocabulary Program",
                "slug": "morphology-matters-vocabulary",
                "sku": "UL-CM-004",
                "price": "119.99",
                "stock": 45,
                "featured": False,
                "description": "Explicit morphology instruction program covering Latin and Greek roots, prefixes, and suffixes for grades 4-8.",
            },
            # Assessment Tools
            {
                "category": categories["assessment-tools"],
                "name": "Diagnostic Reading Assessment Kit",
                "slug": "diagnostic-reading-assessment-kit",
                "sku": "UL-AT-001",
                "price": "299.99",
                "stock": 25,
                "featured": True,
                "description": "Complete diagnostic assessment kit for identifying specific reading skill gaps. Includes phonological awareness screener, decoding inventory, fluency passages, and comprehension measures.",
            },
            {
                "category": categories["assessment-tools"],
                "name": "Progress Monitoring Probes Pack",
                "slug": "progress-monitoring-probes",
                "sku": "UL-AT-002",
                "price": "89.99",
                "stock": 80,
                "featured": False,
                "description": "Set of 36 curriculum-based measurement probes for weekly progress monitoring of oral reading fluency and maze comprehension.",
            },
            {
                "category": categories["assessment-tools"],
                "name": "Spelling Inventory & Analysis Tool",
                "slug": "spelling-inventory-analysis",
                "sku": "UL-AT-003",
                "price": "59.99",
                "stock": 100,
                "featured": False,
                "description": "Developmental spelling inventory with feature analysis guides to determine students' orthographic knowledge stage and plan targeted instruction.",
            },
            # Professional Development
            {
                "category": categories["professional-development"],
                "name": "Science of Reading Certification Course",
                "slug": "science-of-reading-certification",
                "sku": "UL-PD-001",
                "price": "599.99",
                "stock": 200,
                "featured": True,
                "description": "40-hour online certification course covering the Science of Reading, Scarborough's Reading Rope, and evidence-based instructional practices. Includes coaching sessions.",
            },
            {
                "category": categories["professional-development"],
                "name": "Dyslexia Awareness Workshop Series",
                "slug": "dyslexia-awareness-workshop",
                "sku": "UL-PD-002",
                "price": "349.99",
                "stock": 150,
                "featured": True,
                "description": "Four-part professional development series on identifying, supporting, and instructing students with dyslexia. Meets IDEA compliance requirements.",
            },
            {
                "category": categories["professional-development"],
                "name": "Literacy Coaching Toolkit",
                "slug": "literacy-coaching-toolkit",
                "sku": "UL-PD-003",
                "price": "199.99",
                "stock": 75,
                "featured": False,
                "description": "Comprehensive toolkit for literacy coaches including observation protocols, feedback frameworks, data analysis templates, and professional learning community guides.",
            },
            # Classroom Resources
            {
                "category": categories["classroom-resources"],
                "name": "Decodable Readers Classroom Library Set",
                "slug": "decodable-readers-library-set",
                "sku": "UL-CR-001",
                "price": "179.99",
                "stock": 40,
                "featured": True,
                "description": "Set of 60 decodable readers systematically aligned to phonics scope and sequence. Includes fiction and nonfiction titles across six progressive levels.",
            },
            {
                "category": categories["classroom-resources"],
                "name": "Phoneme-Grapheme Mapping Cards",
                "slug": "phoneme-grapheme-mapping-cards",
                "sku": "UL-CR-002",
                "price": "39.99",
                "stock": 120,
                "featured": False,
                "description": "Durable laminated mapping cards for explicit phoneme-grapheme correspondence instruction. Includes all 44 English phonemes with common spellings.",
            },
            {
                "category": categories["classroom-resources"],
                "name": "Syllable Division Strategy Posters",
                "slug": "syllable-division-strategy-posters",
                "sku": "UL-CR-003",
                "price": "29.99",
                "stock": 150,
                "featured": False,
                "description": "Set of 8 full-color classroom posters illustrating syllable division rules (VC/CV, V/CV, VC/V, etc.) with example words and student-friendly explanations.",
            },
            {
                "category": categories["classroom-resources"],
                "name": "Interactive Word Study Notebook Kit",
                "slug": "interactive-word-study-notebook",
                "sku": "UL-CR-004",
                "price": "24.99",
                "stock": 200,
                "featured": False,
                "description": "Student notebook kit with templates for word sorts, word hunts, vocabulary journals, and morphology analysis. Pack of 30 student notebooks.",
            },
            {
                "category": categories["classroom-resources"],
                "name": "Fluency Practice Partner Reads Collection",
                "slug": "fluency-practice-partner-reads",
                "sku": "UL-CR-005",
                "price": "69.99",
                "stock": 55,
                "featured": True,
                "description": "Collection of 40 paired reading passages with built-in fluency tracking sheets. Covers poetry, prose, and reader's theater formats for grades 2-5.",
            },
        ]

        for product_data in products:
            Product.objects.get_or_create(
                sku=product_data["sku"],
                defaults=product_data,
            )
