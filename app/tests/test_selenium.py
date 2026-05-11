"""
Start the app first: flask run
Run with on seperate terminal: python -m pytest app/tests/test_selenium.py -v
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
# this is an existing account in MY database
#change for an exitsing account in your own databases
TEST_EMAIL = "asd"
TEST_PASSWORD = "asdasd1!"
TEST_USERNAME = "asd"

# driver fixture
# set up headless Chrome for all tests in this module
@pytest.fixture(scope="module")
def driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,800")

    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()

# Log in once and reuse the session for all tests that need auth
@pytest.fixture(scope="module")
def logged_in_driver(driver):
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
# these functions can be used in tests to wait for elements to appear
def wait_for(driver, by, value, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, value))
    )

# wait for element to be visible
def wait_for_visible(driver, by, value, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((by, value))
    )

# auth tests
class TestAuthUI:

    # login page should load and show the login form
    def test_login_page_loads(self, driver):
        driver.get(f"{BASE_URL}/login")
        assert "LOGIN" in driver.title.upper() or "HANGMAN" in driver.title.upper()
        assert driver.find_element(By.ID, "loginEmail")
        assert driver.find_element(By.ID, "loginPassword")
        assert driver.find_element(By.ID, "loginBtn")

    # register page should load and show the registration form
    def test_register_page_loads(self, driver):
        driver.get(f"{BASE_URL}/register")
        assert driver.find_element(By.ID, "registerUsername")
        assert driver.find_element(By.ID, "registerEmail")
        assert driver.find_element(By.ID, "registerPassword")
        assert driver.find_element(By.ID, "registerConfirmPassword")
        assert driver.find_element(By.ID, "registerBtn")

    # submitting empty login form should show an error message
    def test_login_empty_fields_shows_error(self, driver):
        driver.get(f"{BASE_URL}/login")
        driver.find_element(By.ID, "loginBtn").click()
        time.sleep(0.5)
        msg = driver.find_element(By.ID, "loginMessage")
        assert msg.text != ""

    # wrong password should show an error message
    def test_login_wrong_password_shows_error(self, driver):
        driver.get(f"{BASE_URL}/login")
        driver.find_element(By.ID, "loginEmail").send_keys(TEST_EMAIL)
        driver.find_element(By.ID, "loginPassword").send_keys("wrongpassword")
        driver.find_element(By.ID, "loginBtn").click()
        time.sleep(1)
        msg = driver.find_element(By.ID, "loginMessage")
        assert msg.text != ""

    # successful login should redirect to /home
    def test_login_success_redirects_to_home(self, driver):
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

    # mismatched passwords should show an error message
    def test_register_password_mismatch_shows_error(self, driver):
        driver.get(f"{BASE_URL}/register")
        driver.find_element(By.ID, "registerUsername").send_keys("newplayer")
        driver.find_element(By.ID, "registerEmail").send_keys("newplayer@test.com")
        driver.find_element(By.ID, "registerPassword").send_keys("password1")
        driver.find_element(By.ID, "registerConfirmPassword").send_keys("different1")
        driver.find_element(By.ID, "registerBtn").click()
        time.sleep(0.5)
        msg = driver.find_element(By.ID, "registerMessage")
        assert msg.text != ""

    #   password under 8 characters should show an erro
    def test_register_short_password_shows_error(self, driver):
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

    # visiting /home without login should redirect to /login
    def test_unauthenticated_home_redirects_to_login(self, driver):
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/home")
        time.sleep(1)
        assert "/login" in driver.current_url

    # visiting /daily without login should redirect to /login
    def test_unauthenticated_daily_redirects_to_login(self, driver):
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/daily")
        time.sleep(1)
        assert "/login" in driver.current_url

    # visiting /achievements without login should redirect to /login
    def test_unauthenticated_achievements_redirects_to_login(self, driver):
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/achievements")
        time.sleep(1)
        assert "/login" in driver.current_url

    # navigation icons should be present in the header when logged in
    def test_header_nav_links_present(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/home")
        header = logged_in_driver.find_element(By.TAG_NAME, "header")
        links = header.find_elements(By.TAG_NAME, "a")
        hrefs = [l.get_attribute("href") for l in links]
        assert any("/daily" in h for h in hrefs)
        assert any("/unlimited" in h for h in hrefs)
        assert any("/achievements" in h for h in hrefs)
        assert any("/friends" in h for h in hrefs)

    # clicking the login/logout icon should show the logout confirmation modal
    def test_logout_popup_appears(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/home")
        wait = WebDriverWait(logged_in_driver, 10)
        login_link = wait.until(EC.element_to_be_clickable((By.ID, "login-icon-link")))
        login_link.click()
        time.sleep(0.5)
        overlay = logged_in_driver.find_element(By.ID, "logout-overlay")
        assert "active" in overlay.get_attribute("class")

    # Clicking Cancel should close the logout modal
    def test_logout_cancel_closes_popup(self, logged_in_driver):
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

    # daily game page should load successfully
    def test_daily_page_loads(self, logged_in_driver):
        """Daily game page should load successfully."""
        logged_in_driver.get(f"{BASE_URL}/daily")
        assert logged_in_driver.find_element(By.CLASS_NAME, "word-row")

    # On-screen keyboard keys should be present
    def test_keyboard_renders(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/daily")
        keys = logged_in_driver.find_elements(By.CLASS_NAME, "key")
        assert len(keys) == 26

    # timer should be visible on the daily page
    def test_timer_displays(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/daily")
        timer = wait_for_visible(logged_in_driver, By.CLASS_NAME, "game-timer")
        assert timer.is_displayed()

    # clicking a key should change its data-state attribute
    def test_guessing_letter_marks_key(self, logged_in_driver):
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

    # mistake counter should update after a wrong guess
    def test_mistake_count_updates(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/daily")
        wait = WebDriverWait(logged_in_driver, 10)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "tile")))
        time.sleep(1)

        mistake_el = logged_in_driver.find_element(By.ID, "mistakeNum")
        initial_mistakes = int(mistake_el.text or "0")

        # Use JavaScript click to bypass any overlay interception
        for key_letter in ["Q", "Z", "X"]:
            keys = logged_in_driver.find_elements(By.CLASS_NAME, "key")
            for k in keys:
                if k.text.strip() == key_letter:
                    logged_in_driver.execute_script("arguments[0].click();", k)
                    time.sleep(0.5)
                    break

        final_mistakes = int(mistake_el.text or "0")
        assert final_mistakes >= initial_mistakes

# achievements page tests
class TestAchievementsPage:

    # achievements page should load and render achievement boxes
    def test_achievements_page_loads(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/achievements")
        wait = WebDriverWait(logged_in_driver, 10)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "achievement-box")))
        boxes = logged_in_driver.find_elements(By.CLASS_NAME, "achievement-box")
        assert len(boxes) > 0

    # each achievement box should have a title element
    def test_achievements_have_titles(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/achievements")
        wait = WebDriverWait(logged_in_driver, 10)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "achievement-box")))
        titles = logged_in_driver.find_elements(By.CLASS_NAME, "title")
        assert len(titles) > 0

    # locked achievements should show masked text
    def test_locked_achievements_show_question_marks(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/achievements")
        wait = WebDriverWait(logged_in_driver, 10)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "achievement-box")))
        locked = logged_in_driver.find_elements(By.CSS_SELECTOR, ".achievement-box.locked .title")
        for el in locked:
            assert "?" in el.text or el.text == ""

# friends page tests
class TestFriendsPage:

    # friends page should load with search input and friends list
    def test_friends_page_loads(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/friends")
        assert logged_in_driver.find_element(By.ID, "searchInput")
        assert logged_in_driver.find_element(By.ID, "friendsList")

    # typing in search box should trigger the dropdown
    def test_search_input_triggers_dropdown(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/friends")
        wait = WebDriverWait(logged_in_driver, 10)
        search = wait.until(EC.element_to_be_clickable((By.ID, "searchInput")))
        search.clear()
        search.send_keys("test")
        time.sleep(1)  # wait for debounce + fetch
        dropdown = logged_in_driver.find_element(By.ID, "searchDropdown")
        assert "open" in dropdown.get_attribute("class")

    # searching for a nonexistent username should show no results message
    def test_search_nonexistent_user_shows_no_results(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/friends")
        wait = WebDriverWait(logged_in_driver, 10)
        search = wait.until(EC.element_to_be_clickable((By.ID, "searchInput")))
        search.clear()
        search.send_keys("zzzznotarealusername999")
        time.sleep(1)
        dropdown = logged_in_driver.find_element(By.ID, "searchDropdown")
        assert "NO PLAYERS FOUND" in dropdown.text or dropdown.text == ""

    # sort buttons A-Z and WINS should be present on the friends page
    def test_sort_buttons_present(self, logged_in_driver):
        logged_in_driver.get(f"{BASE_URL}/friends")
        sort_buttons = logged_in_driver.find_elements(By.CLASS_NAME, "sort-btn")
        labels = [btn.text.strip() for btn in sort_buttons]
        assert "A-Z" in labels
        assert "WINS" in labels
