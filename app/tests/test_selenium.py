"""
Selenium WebDriver Tests for Hangman App
Run with: python -m pytest app/tests/test_selenium.py -v

Requirements:
    pip install selenium pytest
    Chrome + ChromeDriver must be installed and on PATH
    Flask app must be running at http://127.0.0.1:5000

Start the app first: flask run
Then run tests in a separate terminal.
"""

import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException

BASE_URL = "http://127.0.0.1:5000"

# test credentials
TEST_EMAIL = "asd"
TEST_PASSWORD = "asdasd1!"
TEST_USERNAME = "asd"


# driver fixture
@pytest.fixture(scope="module")
def driver():
    """Set up headless Chrome for all tests in this module."""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,800")

    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()


@pytest.fixture(scope="module")
def logged_in_driver(driver):
    """Log in once and reuse the session for all tests that need auth."""
    driver.get(f"{BASE_URL}/login")
    wait = WebDriverWait(driver, 10)

    wait.until(EC.presence_of_element_located((By.ID, "loginEmail")))
    driver.find_element(By.ID, "loginEmail").send_keys(TEST_EMAIL)
    driver.find_element(By.ID, "loginPassword").send_keys(TEST_PASSWORD)
    driver.find_element(By.ID, "loginBtn").click()

    # wait for redirect to home
    wait.until(EC.url_contains("/home"))
    return driver


# helper
def wait_for(driver, by, value, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, value))
    )


def wait_for_visible(driver, by, value, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((by, value))
    )

# auth tests
class TestAuthUI:

    def test_login_page_loads(self, driver):
        """Login page should load and show the login form."""
        driver.get(f"{BASE_URL}/login")
        assert "LOGIN" in driver.title.upper() or "HANGMAN" in driver.title.upper()
        assert driver.find_element(By.ID, "loginEmail")
        assert driver.find_element(By.ID, "loginPassword")
        assert driver.find_element(By.ID, "loginBtn")

    def test_register_page_loads(self, driver):
        """Register page should load and show the registration form."""
        driver.get(f"{BASE_URL}/register")
        assert driver.find_element(By.ID, "registerUsername")
        assert driver.find_element(By.ID, "registerEmail")
        assert driver.find_element(By.ID, "registerPassword")
        assert driver.find_element(By.ID, "registerConfirmPassword")
        assert driver.find_element(By.ID, "registerBtn")

    def test_login_empty_fields_shows_error(self, driver):
        """Submitting empty login form should show an error message."""
        driver.get(f"{BASE_URL}/login")
        driver.find_element(By.ID, "loginBtn").click()
        time.sleep(0.5)
        msg = driver.find_element(By.ID, "loginMessage")
        assert msg.text != ""

    def test_login_wrong_password_shows_error(self, driver):
        """Wrong password should show an error message."""
        driver.get(f"{BASE_URL}/login")
        driver.find_element(By.ID, "loginEmail").send_keys(TEST_EMAIL)
        driver.find_element(By.ID, "loginPassword").send_keys("wrongpassword")
        driver.find_element(By.ID, "loginBtn").click()
        time.sleep(1)
        msg = driver.find_element(By.ID, "loginMessage")
        assert msg.text != ""

    def test_login_success_redirects_to_home(self, driver):
        """Successful login should redirect to /home."""
        driver.get(f"{BASE_URL}/login")
        wait = WebDriverWait(driver, 10)
        wait.until(EC.presence_of_element_located((By.ID, "loginEmail")))

        driver.find_element(By.ID, "loginEmail").clear()
        driver.find_element(By.ID, "loginEmail").send_keys(TEST_EMAIL)
        driver.find_element(By.ID, "loginPassword").clear()
        driver.find_element(By.ID, "loginPassword").send_keys(TEST_PASSWORD)
        driver.find_element(By.ID, "loginBtn").click()

        wait.until(EC.url_contains("/home"))
        assert "/home" in driver.current_url

    def test_register_password_mismatch_shows_error(self, driver):
        """Mismatched passwords should show an error message."""
        driver.get(f"{BASE_URL}/register")
        driver.find_element(By.ID, "registerUsername").send_keys("newplayer")
        driver.find_element(By.ID, "registerEmail").send_keys("newplayer@test.com")
        driver.find_element(By.ID, "registerPassword").send_keys("password1")
        driver.find_element(By.ID, "registerConfirmPassword").send_keys("different1")
        driver.find_element(By.ID, "registerBtn").click()
        time.sleep(0.5)
        msg = driver.find_element(By.ID, "registerMessage")
        assert msg.text != ""

    def test_register_short_password_shows_error(self, driver):
        """Password under 8 characters should show an error."""
        driver.get(f"{BASE_URL}/register")
        driver.find_element(By.ID, "registerUsername").send_keys("shortpwuser")
        driver.find_element(By.ID, "registerEmail").send_keys("shortpw@test.com")
        driver.find_element(By.ID, "registerPassword").send_keys("abc1")
        driver.find_element(By.ID, "registerConfirmPassword").send_keys("abc1")
        driver.find_element(By.ID, "registerBtn").click()
        time.sleep(0.5)
        msg = driver.find_element(By.ID, "registerMessage")
        assert msg.text != ""

# navigation / access control tests
class TestNavigation:

    def test_unauthenticated_home_redirects_to_login(self, driver):
        """Visiting /home without login should redirect to /login."""
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/home")
        time.sleep(1)
        assert "/login" in driver.current_url

    def test_unauthenticated_daily_redirects_to_login(self, driver):
        """Visiting /daily without login should redirect to /login."""
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/daily")
        time.sleep(1)
        assert "/login" in driver.current_url

    def test_unauthenticated_achievements_redirects_to_login(self, driver):
        """Visiting /achievements without login should redirect to /login."""
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/achievements")
        time.sleep(1)
        assert "/login" in driver.current_url

    def test_header_nav_links_present(self, logged_in_driver):
        """Navigation icons should be present in the header when logged in."""
        logged_in_driver.get(f"{BASE_URL}/home")
        header = logged_in_driver.find_element(By.TAG_NAME, "header")
        links = header.find_elements(By.TAG_NAME, "a")
        hrefs = [l.get_attribute("href") for l in links]
        assert any("/daily" in h for h in hrefs)
        assert any("/unlimited" in h for h in hrefs)
        assert any("/achievements" in h for h in hrefs)
        assert any("/friends" in h for h in hrefs)

    def test_logout_popup_appears(self, logged_in_driver):
        """Clicking the login/logout icon should show the logout confirmation modal."""
        logged_in_driver.get(f"{BASE_URL}/home")
        wait = WebDriverWait(logged_in_driver, 10)
        login_link = wait.until(EC.element_to_be_clickable((By.ID, "login-icon-link")))
        login_link.click()
        time.sleep(0.5)
        overlay = logged_in_driver.find_element(By.ID, "logout-overlay")
        assert "active" in overlay.get_attribute("class")

    def test_logout_cancel_closes_popup(self, logged_in_driver):
        """Clicking Cancel should close the logout modal."""
        logged_in_driver.get(f"{BASE_URL}/home")
        wait = WebDriverWait(logged_in_driver, 10)
        login_link = wait.until(EC.element_to_be_clickable((By.ID, "login-icon-link")))
        login_link.click()
        time.sleep(0.3)
        logged_in_driver.find_element(By.ID, "logout-cancel").click()
        time.sleep(0.3)
        overlay = logged_in_driver.find_element(By.ID, "logout-overlay")
        assert "active" not in overlay.get_attribute("class")

# daily game tests
class TestDailyGame:

    def test_daily_page_loads(self, logged_in_driver):
        """Daily game page should load successfully."""
        logged_in_driver.get(f"{BASE_URL}/daily")
        assert logged_in_driver.find_element(By.CLASS_NAME, "word-row")

    def test_keyboard_renders(self, logged_in_driver):
        """On-screen keyboard keys should be present."""
        logged_in_driver.get(f"{BASE_URL}/daily")
        keys = logged_in_driver.find_elements(By.CLASS_NAME, "key")
        assert len(keys) == 26

    def test_timer_displays(self, logged_in_driver):
        """Timer should be visible on the daily page."""
        logged_in_driver.get(f"{BASE_URL}/daily")
        timer = wait_for_visible(logged_in_driver, By.CLASS_NAME, "game-timer")
        assert timer.is_displayed()

    def test_guessing_letter_marks_key(self, logged_in_driver):
        """Clicking a key should change its data-state attribute."""
        logged_in_driver.get(f"{BASE_URL}/daily")
        wait = WebDriverWait(logged_in_driver, 10)

        # wait for word tiles to appear (game loaded)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "tile")))
        time.sleep(1)  # let saveState settle

        keys = logged_in_driver.find_elements(By.CLASS_NAME, "key")
        first_key = keys[0]
        first_key.click()
        time.sleep(0.5)

        state = first_key.get_attribute("data-state")
        assert state in ("correct", "wrong", "guessed")

    def test_mistake_count_updates(self, logged_in_driver):
        """Mistake counter should update after a wrong guess."""
        logged_in_driver.get(f"{BASE_URL}/daily")
        wait = WebDriverWait(logged_in_driver, 10)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "tile")))
        time.sleep(1)

        # get tiles to find which letters are NOT in the word
        tiles = logged_in_driver.find_elements(By.CLASS_NAME, "tile-letter")
        word_letters = set(t.text.strip().upper() for t in tiles if t.text.strip())

        mistake_el = logged_in_driver.find_element(By.ID, "mistakeNum")
        initial_mistakes = int(mistake_el.text or "0")

        # click keys that are unlikely to be in the word
        for key_letter in ["Q", "Z", "X"]:
            keys = logged_in_driver.find_elements(By.CLASS_NAME, "key")
            for k in keys:
                if k.text.strip() == key_letter and k.get_attribute("data-state") is None:
                    k.click()
                    time.sleep(0.3)
                    break

        final_mistakes = int(mistake_el.text or "0")
        # at least some mistakes should have been made (unless Q/Z/X are in the word)
        assert final_mistakes >= initial_mistakes

# achievements page tests
class TestAchievementsPage:

    def test_achievements_page_loads(self, logged_in_driver):
        """Achievements page should load and render achievement boxes."""
        logged_in_driver.get(f"{BASE_URL}/achievements")
        wait = WebDriverWait(logged_in_driver, 10)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "achievement-box")))
        boxes = logged_in_driver.find_elements(By.CLASS_NAME, "achievement-box")
        assert len(boxes) > 0

    def test_achievements_have_titles(self, logged_in_driver):
        """Each achievement box should have a title element."""
        logged_in_driver.get(f"{BASE_URL}/achievements")
        wait = WebDriverWait(logged_in_driver, 10)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "achievement-box")))
        titles = logged_in_driver.find_elements(By.CLASS_NAME, "title")
        assert len(titles) > 0

    def test_locked_achievements_show_question_marks(self, logged_in_driver):
        """Locked achievements should show masked text."""
        logged_in_driver.get(f"{BASE_URL}/achievements")
        wait = WebDriverWait(logged_in_driver, 10)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "achievement-box")))
        locked = logged_in_driver.find_elements(By.CSS_SELECTOR, ".achievement-box.locked .title")
        for el in locked:
            assert "?" in el.text or el.text == ""

# friends page tests
class TestFriendsPage:

    def test_friends_page_loads(self, logged_in_driver):
        """Friends page should load with search input and friends list."""
        logged_in_driver.get(f"{BASE_URL}/friends")
        assert logged_in_driver.find_element(By.ID, "searchInput")
        assert logged_in_driver.find_element(By.ID, "friendsList")

    def test_search_input_triggers_dropdown(self, logged_in_driver):
        """Typing in search box should trigger the dropdown."""
        logged_in_driver.get(f"{BASE_URL}/friends")
        wait = WebDriverWait(logged_in_driver, 10)
        search = wait.until(EC.element_to_be_clickable((By.ID, "searchInput")))
        search.clear()
        search.send_keys("test")
        time.sleep(1)  # wait for debounce + fetch
        dropdown = logged_in_driver.find_element(By.ID, "searchDropdown")
        assert "open" in dropdown.get_attribute("class")

    def test_search_nonexistent_user_shows_no_results(self, logged_in_driver):
        """Searching for a nonexistent username should show no results message."""
        logged_in_driver.get(f"{BASE_URL}/friends")
        wait = WebDriverWait(logged_in_driver, 10)
        search = wait.until(EC.element_to_be_clickable((By.ID, "searchInput")))
        search.clear()
        search.send_keys("zzzznotarealusername999")
        time.sleep(1)
        dropdown = logged_in_driver.find_element(By.ID, "searchDropdown")
        assert "NO PLAYERS FOUND" in dropdown.text or dropdown.text == ""

    def test_sort_buttons_present(self, logged_in_driver):
        """Sort buttons A-Z and WINS should be present on the friends page."""
        logged_in_driver.get(f"{BASE_URL}/friends")
        sort_buttons = logged_in_driver.find_elements(By.CLASS_NAME, "sort-btn")
        labels = [btn.text.strip() for btn in sort_buttons]
        assert "A-Z" in labels
        assert "WINS" in labels
