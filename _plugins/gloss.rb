# _plugins/gloss.rb

require "cgi"

module Jekyll
  class GlossBlock < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super

      if markup =~ /(\S+)\s+"([^"]+)"/
        @number = Regexp.last_match(1)
        @title = Regexp.last_match(2)
      else
        @number = markup.strip
        @title = nil
      end
    end

    def render(context)
      raw = super.strip
      lines = raw.lines.map(&:strip).reject(&:empty?)

      source = nil
      trans = nil
      token_line = nil
      gloss_line = nil
      translation = nil

      lines.each do |line|
        case line
        when /^source:\s*(.+)$/i
          source = Regexp.last_match(1).strip
        when /^trans:\s*(.+)$/i
          trans = Regexp.last_match(1).strip
        when /^tokens?:\s*(.+)$/i
          token_line = Regexp.last_match(1).strip
        when /^gloss:\s*(.+)$/i
          gloss_line = Regexp.last_match(1).strip
        when /^translation:\s*(.+)$/i
          translation = Regexp.last_match(1).strip
        else
          # 예전 방식 호환:
          # 民 | 可 | 使 | 由 | 之
          # '백성은 ...'
          if line.include?("|") && token_line.nil?
            token_line = line
          elsif translation.nil?
            translation = line
          end
        end
      end

      tokens = split_cells(token_line)
      glosses = split_cells(gloss_line)

      html = []
      html << %(<div class="gloss-block">)

      html << %(<div class="gloss-label">)
      html << %(예문 #{@number})
      html << %( <span class="gloss-title">#{escape_html(@title)}</span>) if @title
      html << %(</div>)

      html << %(<div class="gloss-grid">)

      if source
        html << %(<div class="gloss-source">#{escape_html(source)}</div>)
      end

      if trans
        html << %(<div class="gloss-trans">#{escape_html(trans)}</div>)
      end

      max = [tokens.length, glosses.length].max

      max.times do |i|
        token = tokens[i] || ""
        gloss = glosses[i] || ""

        html << %(<div class="gloss-cell">)
        html << %(<div class="gloss-object">#{escape_html(token)}</div>)
        html << %(<div class="gloss-morpheme">#{format_gloss(gloss)}</div>)
        html << %(</div>)
      end

      html << %(</div>)

      if translation
        html << %(<div class="gloss-translation">#{escape_html(translation)}</div>)
      end

      html << %(</div>)
      html.join("\n")
    end

    private

    def split_cells(line)
      return [] if line.nil?
      line.split("|").map(&:strip)
    end

    def escape_html(text)
      CGI.escapeHTML(text.to_s)
    end

    def format_gloss(text)
      escaped = escape_html(text.to_s)

      # 대문자로 된 문법표지를 자동 small-caps 처리
      # 예: 1SG, COP, PST, NEG, ACC, GEN
      escaped.gsub(/\b([A-Z][A-Z0-9.-]*)\b/) do
        %(<span class="gloss-smallcaps">#{Regexp.last_match(1).downcase}</span>)
      end
    end
  end
end

Liquid::Template.register_tag("gloss", Jekyll::GlossBlock)
