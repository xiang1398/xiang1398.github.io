# _plugins/gloss.rb

require "cgi"

module Jekyll
  class GlossBlock < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      content = super.strip
      lines = content.lines.map(&:strip).reject(&:empty?)

      number = nil
      title = nil

      if @markup =~ /^(\d+)(?:\s+"([^"]+)")?/
        number = Regexp.last_match(1)
        title = Regexp.last_match(2)
      elsif @markup =~ /^"([^"]+)"/
        title = Regexp.last_match(1)
      end

      source_line = nil
      trans_line = nil
      object_line = nil
      gloss_line = nil
      translation = nil

      lines.each do |line|
        if line.start_with?("source:")
          source_line = line.sub(/^source:\s*/, "")
        elsif line.start_with?("trans:")
          trans_line = line.sub(/^trans:\s*/, "")
        elsif line.start_with?("gloss:")
          gloss_line = line.sub(/^gloss:\s*/, "")
        elsif line.match?(/\A['"].*['"]\z/)
          translation = line
        elsif object_line.nil?
          object_line = line
        elsif gloss_line.nil?
          gloss_line = line
        end
      end

      object_cells = split_cells(object_line)
      gloss_cells = split_cells(gloss_line)

      html = +"<div class=\"gloss-block\">"

      if number || title
        html << "<div class=\"gloss-label\">"
        html << "(#{number})" if number
        html << " <span class=\"gloss-title\">#{escape_html(title)}</span>" if title
        html << "</div>"
      end

      if source_line
        html << "<div class=\"gloss-source\">#{escape_html(source_line)}</div>"
      end

      if trans_line
        html << "<div class=\"gloss-trans\">#{escape_html(trans_line)}</div>"
      end

      if object_cells.any? || gloss_cells.any?
        html << "<div class=\"gloss-grid\">"

        max = [object_cells.length, gloss_cells.length].max

        max.times do |i|
          obj = object_cells[i] || ""
          glo = gloss_cells[i] || ""

          html << "<div class=\"gloss-cell\">"
          html << "<div class=\"gloss-object\">#{escape_html(obj)}</div>"
          html << "<div class=\"gloss-morpheme\">#{smallcaps(escape_html(glo))}</div>"
          html << "</div>"
        end

        html << "</div>"
      end

      if translation
        html << "<div class=\"gloss-translation\">#{escape_html(translation)}</div>"
      end

      html << "</div>"

      html
    end

    private

    def split_cells(line)
      return [] if line.nil?

      line.split("|").map(&:strip)
    end

    def escape_html(text)
      return "" if text.nil?

      CGI.escapeHTML(text)
    end

    def smallcaps(text)
      text.gsub(/\b[A-Z][A-Z0-9.=-]*\b/) do |match|
        "<span class=\"gloss-smallcaps\">#{match.downcase}</span>"
      end
    end
  end
end

Liquid::Template.register_tag("gloss", Jekyll::GlossBlock)
