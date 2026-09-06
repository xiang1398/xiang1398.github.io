# frozen_string_literal: true

require "cgi"

module Jekyll
  class BlogStatsGenerator < Generator
    safe true
    priority :low

    def generate(site)
      posts = site.posts.docs.reject { |post| post.data["hidden"] == true }
      converter = site.find_converter_instance(Jekyll::Converters::Markdown)

      rows = posts.map do |post|
        count = character_count(post.content.to_s, converter)
        post.data["character_count"] = count

        {
          "title" => post.data["title"].to_s,
          "url" => post.url,
          "date" => post.date.strftime("%Y-%m-%d"),
          "character_count" => count,
          "character_count_formatted" => format_number(count)
        }
      end

      total_characters = rows.sum { |row| row["character_count"] }

      rows.each do |row|
        row["percentage"] = if total_characters.positive?
                              ((row["character_count"] * 100.0) / total_characters).round(2)
                            else
                              0.0
                            end
      end

      rows.sort_by! { |row| [-row["character_count"], row["title"]] }

      site.data["blog_stats"] = {
        "post_count" => rows.length,
        "post_count_formatted" => format_number(rows.length),
        "total_characters" => total_characters,
        "total_characters_formatted" => format_number(total_characters),
        "posts" => rows
      }
    end

    private

    def character_count(markdown, converter)
      html = converter.convert(markdown)
      text = html
             .gsub(/<!--.*?-->/m, " ")
             .gsub(/<script\b[^>]*>.*?<\/script>/mi, " ")
             .gsub(/<style\b[^>]*>.*?<\/style>/mi, " ")
             .gsub(/<[^>]+>/m, " ")
             .gsub(/\{\{.*?\}\}/m, " ")
             .gsub(/\{%.*?%\}/m, " ")

      text = CGI.unescapeHTML(text).gsub(/\s+/, "")
      text.scan(/\X/).length
    end

    def format_number(number)
      number.to_i.to_s.reverse.scan(/\d{1,3}/).join(",").reverse
    end
  end
end
