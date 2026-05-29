"""
Поиск минимальных цен на товар по маркетплейсам (WB по артикулу, остальные по названию).
"""
import json
import urllib.request
import urllib.parse
import urllib.error
import re


HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "Invalid JSON"})}

    query = body.get("query", "").strip()
    mode = body.get("mode", "name")  # "article" or "name"

    if not query:
        return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "query is required"})}

    results = []

    if mode == "article":
        # Поиск по артикулу WB
        article = re.sub(r"\D", "", query)
        if not article:
            return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "Артикул должен содержать цифры"})}

        wb_result = search_wb_by_article(article)
        if wb_result:
            results.append(wb_result)
            # По названию из WB ищем на других площадках
            product_name = wb_result.get("productName", "")
            if product_name:
                ozon_result = search_ozon_by_name(product_name)
                if ozon_result:
                    results.append(ozon_result)
                ym_result = search_ym_by_name(product_name)
                if ym_result:
                    results.append(ym_result)
    else:
        # Поиск по названию на всех площадках
        wb_result = search_wb_by_name(query)
        if wb_result:
            results.append(wb_result)
        ozon_result = search_ozon_by_name(query)
        if ozon_result:
            results.append(ozon_result)
        ym_result = search_ym_by_name(query)
        if ym_result:
            results.append(ym_result)

    return {
        "statusCode": 200,
        "headers": HEADERS,
        "body": json.dumps({"results": results, "query": query, "mode": mode}, ensure_ascii=False),
    }


def fetch_json(url: str, extra_headers: dict = None) -> dict | None:
    try:
        req = urllib.request.Request(url)
        req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        req.add_header("Accept", "application/json")
        if extra_headers:
            for k, v in extra_headers.items():
                req.add_header(k, v)
        with urllib.request.urlopen(req, timeout=8) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None


def search_wb_by_article(article: str) -> dict | None:
    url = f"https://card.wb.ru/cards/v2/detail?appType=1&curr=rub&dest=-1257786&spp=30&nm={article}"
    data = fetch_json(url)
    if not data:
        return None
    try:
        products = data["data"]["products"]
        if not products:
            return None
        p = products[0]
        sizes = p.get("sizes", [])
        price_raw = None
        for s in sizes:
            price_info = s.get("price", {})
            if price_info.get("product"):
                price_raw = price_info["product"]
                break
        if not price_raw and sizes:
            price_raw = sizes[0].get("price", {}).get("product")

        price = round(price_raw / 100) if price_raw else None
        basic_price = p.get("priceU")
        original_price = round(basic_price / 100) if basic_price else None
        sale_price = p.get("salePriceU")
        if sale_price and not price:
            price = round(sale_price / 100)

        name = p.get("name", "")
        brand = p.get("brand", "")
        full_name = f"{brand} {name}".strip() if brand else name

        rating = p.get("reviewRating", 0)
        feedbacks = p.get("feedbacks", 0)
        article_id = p.get("id", article)

        link = f"https://www.wildberries.ru/catalog/{article_id}/detail.aspx"
        img_host = p.get("pics", 1)
        vol = str(article_id)[:4] if len(str(article_id)) >= 4 else str(article_id)
        part = str(article_id)[:6] if len(str(article_id)) >= 6 else str(article_id)
        image_url = f"https://basket-01.wb.ru/vol{vol}/part{part}/{article_id}/images/small/1.jpg"

        discount = None
        if price and original_price and original_price > price:
            discount = round((1 - price / original_price) * 100)

        return {
            "marketplace": "wb",
            "name": "Wildberries",
            "productName": full_name,
            "price": price,
            "originalPrice": original_price if (original_price and original_price != price) else None,
            "discount": discount,
            "rating": round(rating, 1),
            "reviewCount": feedbacks,
            "delivery": "Зависит от склада",
            "link": link,
            "imageUrl": image_url,
            "article": str(article_id),
        }
    except Exception:
        return None


def search_wb_by_name(query: str) -> dict | None:
    encoded = urllib.parse.quote(query)
    url = f"https://search.wb.ru/exactmatch/ru/common/v9/search?appType=1&curr=rub&dest=-1257786&query={encoded}&resultset=catalog&sort=popular&spp=30&suppressSpellcheck=false"
    data = fetch_json(url, {"x-queryid": "qid123"})
    if not data:
        return None
    try:
        products = data["data"]["products"]
        if not products:
            return None
        p = products[0]
        sizes = p.get("sizes", [])
        price_raw = None
        for s in sizes:
            price_info = s.get("price", {})
            if price_info.get("product"):
                price_raw = price_info["product"]
                break

        price = round(price_raw / 100) if price_raw else None
        basic_price = p.get("priceU")
        original_price = round(basic_price / 100) if basic_price else None

        name = p.get("name", "")
        brand = p.get("brand", "")
        full_name = f"{brand} {name}".strip() if brand else name

        rating = p.get("reviewRating", 0)
        feedbacks = p.get("feedbacks", 0)
        article_id = p.get("id")
        link = f"https://www.wildberries.ru/catalog/{article_id}/detail.aspx" if article_id else "https://www.wildberries.ru"

        discount = None
        if price and original_price and original_price > price:
            discount = round((1 - price / original_price) * 100)

        return {
            "marketplace": "wb",
            "name": "Wildberries",
            "productName": full_name,
            "price": price,
            "originalPrice": original_price if (original_price and original_price != price) else None,
            "discount": discount,
            "rating": round(rating, 1),
            "reviewCount": feedbacks,
            "delivery": "Зависит от склада",
            "link": link,
            "imageUrl": None,
            "article": str(article_id) if article_id else None,
        }
    except Exception:
        return None


def search_ozon_by_name(query: str) -> dict | None:
    encoded = urllib.parse.quote(query)
    url = f"https://api.ozon.ru/composer-api.bx/page/json/v2?url=%2Fsearch%2F%3Ftext%3D{encoded}&layout_container=categorySearchMegapagination&layout_page_index=1"
    data = fetch_json(url, {"x-o3-app-name": "ozon-front", "x-o3-app-version": "3.72.0"})
    if not data:
        return _ozon_fallback(query)
    try:
        items = []
        for widget in (data.get("widgetStates") or {}).values():
            if isinstance(widget, str):
                try:
                    w = json.loads(widget)
                    if isinstance(w, dict) and "items" in w:
                        items = w["items"]
                        break
                except Exception:
                    pass
        if not items:
            return _ozon_fallback(query)
        item = items[0]
        main_state = item.get("mainState", [])
        price = None
        original_price = None
        name = ""
        link = ""
        for block in main_state:
            atom = block.get("atom", {})
            if "price" in atom:
                price_data = atom["price"]
                price_str = price_data.get("price", "").replace("\u00a0", "").replace(" ", "").replace("₽", "")
                original_str = price_data.get("originalPrice", "").replace("\u00a0", "").replace(" ", "").replace("₽", "")
                try:
                    price = int(re.sub(r"\D", "", price_str))
                except Exception:
                    pass
                try:
                    original_price = int(re.sub(r"\D", "", original_str)) if original_str else None
                except Exception:
                    pass
            if atom.get("type") == "label" and not name:
                name = atom.get("label", {}).get("textMarkup", "")
        action = item.get("action", {})
        link_path = action.get("link", "")
        link = f"https://www.ozon.ru{link_path}" if link_path else "https://www.ozon.ru"

        discount = None
        if price and original_price and original_price > price:
            discount = round((1 - price / original_price) * 100)

        return {
            "marketplace": "ozon",
            "name": "Ozon",
            "productName": name or query,
            "price": price,
            "originalPrice": original_price,
            "discount": discount,
            "rating": None,
            "reviewCount": 0,
            "delivery": "Уточните на сайте",
            "link": link,
            "imageUrl": None,
            "article": None,
        }
    except Exception:
        return _ozon_fallback(query)


def _ozon_fallback(query: str) -> dict:
    encoded = urllib.parse.quote(query)
    return {
        "marketplace": "ozon",
        "name": "Ozon",
        "productName": query,
        "price": None,
        "originalPrice": None,
        "discount": None,
        "rating": None,
        "reviewCount": 0,
        "delivery": "Уточните на сайте",
        "link": f"https://www.ozon.ru/search/?text={encoded}",
        "imageUrl": None,
        "article": None,
        "searchOnly": True,
    }


def search_ym_by_name(query: str) -> dict | None:
    encoded = urllib.parse.quote(query)
    url = f"https://market.yandex.ru/search?text={encoded}"
    return {
        "marketplace": "ym",
        "name": "Яндекс Маркет",
        "productName": query,
        "price": None,
        "originalPrice": None,
        "discount": None,
        "rating": None,
        "reviewCount": 0,
        "delivery": "Уточните на сайте",
        "link": url,
        "imageUrl": None,
        "article": None,
        "searchOnly": True,
    }
