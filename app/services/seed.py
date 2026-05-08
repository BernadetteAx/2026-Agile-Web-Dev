from app import db
from app.models import Achievement

def seed_achievements(): 
    achievements = [
        Achievement(
            name="FIRST WIN",
            description="Win your first game",
            condition_type="win_games",
            threshold_value=1,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA2UlEQVR4nO3QQQ7DIAxEUd//0tN1LFUoEYwN/LetGg8/AgCAz1QsqokAtarfH8cHULNB9j0iwDtTXtlpjwjw9Pb32ex7RIA1B1f97+t37QcJkFTvsR8kQFK9x36QAEn1HvtBAiTVe+wHCZBU77Ef3DbAyKyHuPfYD14f4CsCNNsT7oP2B44QIDnt3hABktPuDV0fYDRwtuhOBFgrutPtAf4ZPeSYh/5DgOTt79vTbQE0WexGBJgrdqPbAmjx4PZBRICn3b7ffuB2AVaLbmQW3YgAXtXvBQDEAX6Fs5FCYTw98QAAAABJRU5ErkJggg=="
        ),
        Achievement(
            name="WIN 10 GAMES",
            description="Win 10 games",
            condition_type="win_games",
            threshold_value=10,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAABXUlEQVR4nO2buVIEMQwFxX39/59yw9IkJBZbNTtIsmWsTqem1fsCimREimIIKGQ1qAFaZDX4bwMAB07ncWuALYFkAyN7fZINVh4AOFtuAAxBwIP1Bw0fhME/oAYwvm8GY8Do92X0QZL7pguuAZx94QdS+zjyj4018MiNvH5+D/CVKjC6HzhXgoNnYIcBbP3AhRJ8egZ2GMDWD1wqwYdnYIcBbP3AlRK8ewZ2GMDWD1zXAC1vnoE/Nxqc3bZ+4EYJXmUizP3ArRK8yESY+4E7JXiWiTD3A/dK8CQT8ad+gtm6N7pHeh/c+zy6R3of3Ps8ukd6H9z7PLqnKIqiIfqPRno/2QOj/WQPjPaTPTDaT/bAaD/ZA6P9ZA+M9pM9sLcfZ2F233TBNYCzL/xAdl/4wdHvm6EGaJntfTOsPoCmvhcwstcn2WDlAVjxewELHt8LTA81QIusBqsPUEgOvgH4roQzKDEJHgAAAABJRU5ErkJggg=="
        ),
        Achievement(
            name="STREAK 5",
            description="Win 5 games in a row",
            condition_type="streak",
            threshold_value=5,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA4ElEQVR4nO2QMRLDQAgD+f+nSW2KEMYcEfZue7Yk1gwAAADgRzxQfVfvS0HA8KDpvhQEBLZ9fxsXOwgBATuNFwvVvm/HkwHdB/394AgCAtl7lWrfOI6AK9l7lWrfOI6A76jnm/pABCT0XCE8cJ0Ae1hfCgICqv8dw98mwJsGqOWsHY6AppzxQrWctcMR0JQzXqiWs3Y4AppyxgvVctYOR0BTznihWs7a4QhoyhkvVMux6QHT/x3DEXDlaX1yg+QEnB4of3AEAQG1vOP42wVkB1Sx7TgC7mHb8bcLAAAA0+UD1V2111HaWt0AAAAASUVORK5CYII="
        ),
        Achievement(
            name="WIN 25 GAMES",
            description="Win 25 games",
            condition_type="win_games",
            threshold_value=25,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAyklEQVR4nO3QQRLEIAwDQf//09ozXKgQ4bXD9JUiKBMBAABgJrPoRgTwim5EAK/oRgTwim50WwAli2pEgFxRjW4PMHs7uN0Pzwgwyb7/d/pqABVHgNNUHAFOU/aD1faIAMkPVtsjAiQ/WG2PCJD8YLU9IkDyg9X2iAAj173VuXvPNhFg5Lq3Onfv2SYCjFz3VufuPdtEgJHr3urcvWebCOCR9V0CuOnQ0FPfJUAVehggvkYEGD09b0+3BZBZdCMCeEU3uj0AACDq+wF7N3JTNsI3HQAAAABJRU5ErkJggg=="
        ),
        Achievement(
            name="WIN 50 GAMES",
            description="Win 50 games",
            condition_type="win_games",
            threshold_value=50,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA20lEQVR4nO3QQQ7EMAhDUd//0p51qTQocoho8NuWhPQDZmYHcBFuQwdYg9vQAdbgNpweIBr3w5EDBJiGDvCEaegAT5iGXw/AZhzgNDbjANV4emG399EBiheIwvMcAO0uPEx+Px3gCR8Tnu8AqL6ACXW/+p7V/XCAoPrBu+9T92NcAG5e2C1Aep4O8J8DJMYH6MYBEvqB5hwgoR9ozgES+oHmHCCxfAHE+erv6vyLAwTqfPV3df7FAQJ1vvq7Ov/iAIE6X/1dnX8ZHyC7sDvsxo9xgN04PYCZmeE+PzdoENGoE2ZNAAAAAElFTkSuQmCC"
        ),
        Achievement(
            name="WIN 100 GAMES",
            description="Win 100 games",
            condition_type="win_games",
            threshold_value=100,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAABBUlEQVR4nO3QMRaAIAxEwb3/pdfKQnwQMUSB7LQiJB+YDA3YHRWgDbtj9gCntIufFKCAbLh7AHbCbqgAfbAbKsAVsqECXCEbrh6Ak1GAr3EyChCNXz8423xUgOAHnIrxFADTXfgx9/xUgKuQKV+8a33vPYewC7IFoGHUuwpQGDW/+4LyvHuAl3N4/8sbgM4FFMDwdHD3Im//4yQBrP+e3ls7V/2fCjBmAS/r3adz1c5V/6cCtGExxjr3vagAbVhM9z5UgDYsxlhHAdB7AQYP9Pd78RcUFKDw93vxF2QLQOeCowMpQMHe2HmBdT76u/f8TfoA1oWzw2hcjAKMxuwBREREBLs5AImw4PIBRYNYAAAAAElFTkSuQmCC"
        ),
        Achievement(
            name="STREAK 3",
            description="Win 3 games in a row",
            condition_type="streak",
            threshold_value=3,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA60lEQVR4nO3QQRbDMAhDQe5/abquFqU8sE3iP9vEIGQGAADwJxfZ79P3hShgc6Dd+0IUIJ72f5kPO4gChK3myYXT/m/nQYDug44frChARN+zsvu2cwr4Fn3Pyu7bzingt+nzbXpACgj0XDE44OMKsJftC1GAyP5ffW+n+W0FeDFAtYDuPGkUIE7P684TogBxel53nhAFiN3vV88LUYDY/X71vBAFiNPzuvOEKECcntedJ0QBovq+e56t5rcXUA1QLeD4wYoCxNv2ha4vYHXA8QcrChDT5i3ntxcQHZBlT+cUUGNP57cXAACwuT6NTjVmGGxrUgAAAABJRU5ErkJggg=="
        ),
        Achievement(
            name="STREAK 10",
            description="Win 10 games in a row",
            condition_type="streak",
            threshold_value=10,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA60lEQVR4nO3QQRbDIAhFUfa/aTruH5RyQCXx3Wki4jMDAAD4k4vs9+n3hQiweaHd94UIIJ72f5kPexABhK3myQun/d/OgwW6H3T8wYoAIvqelb1vOyfAt+h7Vva+7ZwAv02fb9MXJECg5xWDF3xcAHvZfSECiOz/1fN2mt8WwIsLVAN075NGAHF6Xvc+IQKI0/O69wkRQJye171PiABi9/nV80IEELvPr54XIoDYfX71vBABRPV89zxbzW8PUF2gGuD4gxUBxNvuC10fYPWC4x+sCCCmzVvObw8QPSDLns4JUGNP57cHAADYXB+LbDVmX0anYgAAAABJRU5ErkJggg=="
        ),
        Achievement(
            name="STREAK 25",
            description="Win 25 games in a row",
            condition_type="streak",
            threshold_value=25,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA4ElEQVR4nO2QMRLDQAgD+f+nSW2KEMYcEfZue7Yk1gwAAADgRzxQfVfvS0HA8KDpvhQEBLZ9fxsXOwgBATuNFwvVvm/HkwHdB/394AgCAtl7lWrfOI6AK9l7lWrfOI6A76jnm/pABCT0XCE8cJ0Ae1hfCgICqv8dw98mwJsGqOWsHY6AppzxQrWctcMR0JQzXqiWs3Y4AppyxgvVctYOR0BTznihWs7a4QhoyhkvVMux6QHT/x3DEXDlaX1yg+QEnB4of3AEAQG1vOP42wVkB1Sx7TgC7mHb8bcLAAAA0+UD1V2111HaWt0AAAAASUVORK5CYII="
        ),
        Achievement(
            name="FLAWLESS",
            description="Win a game without a single mistake",
            condition_type="no_mistakes",
            threshold_value=1,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA7ElEQVR4nO3QORIEIQwEQf7/6VpbOAQhpGaWTlecNUYRDhtfgwOcNb4GB4i698vhAFH3fjleC8Cm0/vlcIA9p/fL8XqAWfbBn/vwzAEm3fvl+PcAXMYBunEZB6iG+gHq9+AAzRfe9h5eC8DiwOoA2fvT78MBai9Y7a+elz/wcwHY3KD+wOn3DgeYOMCC+oPXB6jmAJP0ek4fWMwBJun1JA9Uc4CF5XqSB6o5wMLu+m2rC6rncjhA1D2XwwGi7rkcDhB1z+VwgKh7LocDRN1zORwg6p7L4QBR91yO1wKQVH2eA1TDAR4PYGbjH/wArZXNPmE56zsAAAAASUVORK5CYII="
        ),
        Achievement(
            name="SPEED DEMON",
            description="Win a game with over 60 seconds remaining",
            condition_type="time_left",
            threshold_value=60,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAApklEQVR4nO3UQQrAIAxE0bn/pafrFFqxCjXJf9sB0b9QAgAA+IkHVJ0J8E7VmQDvVJ0J8E7VuXsAAL0+tVnKxpspGxNgL2XjwQNW9+OZANHq/kSnMgGi1f2JTmUCRLN7eu4eYIQAN+oeYETVeJKqMQHmqBsTIFI3JkCkLPzR6BxlYQJ8MzpHWbh7gF0IcKNuTIBI3ZgAkboxASJ1YwJEf98HAACorAvaU9l76o6n/AAAAABJRU5ErkJggg=="
        ),
        Achievement(
            name="DAILY DEVOTEE",
            description="Complete 7 daily games",
            condition_type="daily_wins",
            threshold_value=7,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAyUlEQVR4nO3UOxaEQAgFUfa/6WdMB7Z9+gdSN3UErGDMAOCFGlbtXhHAs+Cacwlg4QZuRoBGvIGbEaCxfGA2BJil5AgwS52ByxdGu0cEOLww2j0igLf6wNHfr763a/UBBOjYvX+YqgcYdTvAdSKA13veGp0XjqoHAIAvyv+5iQCeVSMCeFaNCOBZNaoWQJ0P/n0QEcAbfZ6eqgXQ5AelDyICeKffv07VAmjzweGDiABetvnhDwwXQIcPIsDhfeEOIsDhfQAAwH7vAQ/G9oj2nZuxAAAAAElFTkSuQmCC"
        ),
        Achievement(
            name="SOCIAL",
            description="Add your first friend",
            condition_type="friends",
            threshold_value=1,
            image_url= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAABAElEQVR4nO2QMRLEIAzE9v+f9tWQgmFsR3BZtXGQZiVjjGkgitFthAeoRbcRXxsgmoOPHyQ8wMht7x8feNwAAQfRftEBtF90AO0XHUD7RQfQftEBtF90AO0XHUD7tQrYDey+Lyc8wEg2sPu+nPAAI1/ziw5o98dCcPoA6b7wAM2CJO194QFqBfP97v/dfe0CD7CA7msX/N0A2aDq97P3DzzARPZ+/l79fvb+gQeYyN7P36vfz94/8ABvCw/ziw6g/e8Lkj4PMIEHdfve7tHnB8gGxCa77+ltwgOM7N6vqPaXEx5g5Gt+0QG0X3QA7RcdQPtFB9B+0QG03xhjjDG6nh8EvvSmpzDb9gAAAABJRU5ErkJggg=="
        )
    ]

    existing_names = {a.name for a in Achievement.query.all()}
    new_achievements = [a for a in achievements if a.name not in existing_names]
    if not new_achievements:
        print("All achievements already seeded")
        return
    db.session.add_all(new_achievements)
    db.session.commit()
    print(f"Seeded {len(new_achievements)} new achievements")