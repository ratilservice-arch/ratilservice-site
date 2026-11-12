import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class SiteMarkup(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.elements = []

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))


class PublishReadinessTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        parser = SiteMarkup()
        parser.feed(cls.html)
        cls.elements = parser.elements

    def test_every_internal_link_has_a_real_target(self):
        ids = {attrs.get("id") for _, attrs in self.elements if attrs.get("id")}
        missing = sorted({
            attrs["href"] for tag, attrs in self.elements
            if tag == "a" and attrs.get("href", "").startswith("#")
            and attrs["href"][1:] not in ids
        })
        self.assertEqual(missing, [])

    def test_every_form_control_has_an_accessible_name(self):
        label_targets = {attrs.get("for") for tag, attrs in self.elements if tag == "label" and attrs.get("for")}
        controls = [
            attrs for tag, attrs in self.elements
            if tag in {"input", "select", "textarea"} and attrs.get("type") != "hidden"
        ]
        missing = [
            attrs.get("id", attrs.get("type", "unnamed control"))
            for attrs in controls
            if not attrs.get("aria-label") and not attrs.get("aria-labelledby")
            and attrs.get("id") not in label_targets
        ]
        self.assertEqual(missing, [])

    def test_mobile_navigation_has_an_accessible_toggle(self):
        controlled_ids = {attrs.get("id") for _, attrs in self.elements if attrs.get("id")}
        toggles = [
            attrs for tag, attrs in self.elements
            if tag == "button" and attrs.get("aria-controls") in controlled_ids
        ]
        self.assertTrue(toggles)
        self.assertTrue(all(attrs.get("aria-expanded") in {"true", "false"} for attrs in toggles))
        self.assertTrue(all(attrs.get("aria-label") for attrs in toggles))

    def test_services_quick_link_targets_a_supported_devices_section(self):
        ids = {attrs.get("id") for _, attrs in self.elements if attrs.get("id")}
        self.assertIn("services", ids)

    def test_store_products_have_direct_product_specific_whatsapp_actions(self):
        product_links = [
            attrs for tag, attrs in self.elements
            if tag == "a" and attrs.get("data-product")
        ]
        self.assertGreaterEqual(len(product_links), 3)
        self.assertTrue(all(attrs.get("href", "").startswith("https://wa.me/213661314631?") for attrs in product_links))

    def test_contact_section_has_phone_and_whatsapp_actions(self):
        links = [attrs.get("href", "") for tag, attrs in self.elements if tag == "a"]
        self.assertTrue(any(href.startswith("tel:+213661314631") for href in links))
        self.assertTrue(any(href.startswith("https://wa.me/213661314631") for href in links))

    def test_search_metadata_and_crawl_files_exist(self):
        metas = [attrs for tag, attrs in self.elements if tag == "meta"]
        links = [attrs for tag, attrs in self.elements if tag == "link"]
        self.assertTrue(any(m.get("name") == "description" and m.get("content") for m in metas))
        self.assertTrue(any(l.get("rel") == "canonical" and l.get("href") == "https://ratilservice.com/" for l in links))
        self.assertTrue((ROOT / "robots.txt").is_file())
        self.assertTrue((ROOT / "sitemap.xml").is_file())

    def test_site_script_is_externalized_for_validation(self):
        self.assertTrue((ROOT / "site.js").is_file())
        self.assertTrue(any(
            tag == "script" and attrs.get("src") == "site.js"
            for tag, attrs in self.elements
        ))


if __name__ == "__main__":
    unittest.main()
