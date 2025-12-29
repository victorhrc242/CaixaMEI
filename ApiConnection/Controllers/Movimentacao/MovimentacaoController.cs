using Microsoft.AspNetCore.Mvc;
using Models.Entidades;
using Models.Repositorios.Movimentacao;
using Models.Service.Movimentacao;
using static Models.Service.Movimentacao.MovimentacaoService;

namespace ApiConnection.Controllers.Movimentacao
{
    [ApiController]
    [Route("api/movimentacao")]
    public class MovimentacaoController : ControllerBase
    {
        private readonly IMovimentacaoService _movimentacaoService;

        public MovimentacaoController(IMovimentacaoService movimentacaoService)
        {
            _movimentacaoService = movimentacaoService;
        }

        // ➕ Criar movimentação
        [HttpPost("adicionar")]
        public async Task<IActionResult> AdicionarMovimentacao([FromBody] Movimentacaos movimentacao)
        {
            if (movimentacao == null)
                return BadRequest("Movimentação inválida");

            await _movimentacaoService.CriarMovimentacaoAsync(movimentacao);
            return Ok();
        }

        // 📄 Listar todas as movimentações do usuário
        [HttpGet("{usuarioId}")]
        public async Task<IActionResult> Listar(Guid usuarioId)
        {
            var result = await _movimentacaoService.listarMovimentacaoesint(usuarioId);
            return Ok(result);
        }

        // 📅 Listar movimentações por mês
        [HttpGet("{usuarioId}/mes")]
        public async Task<IActionResult> ListarPorMes(Guid usuarioId,[FromQuery] int ano,[FromQuery] int mes)
        {
            var dto = new ListarMovimentacoesMesDto
            {
                UsuarioId = usuarioId,
                Ano = ano,
                Mes = mes
            };

            var resultado = await _movimentacaoService.ListarPorMesAsync(dto);
            return Ok(resultado);
        }
        // ✏️ Editar movimentação
        [HttpPut("{id}")]
        public async Task<IActionResult> Editar(Guid id,[FromBody] EditarMovimentacaoDto dto,Guid usuarioid)
        {
            if (dto == null)
                return BadRequest("Dados inválidos");

            await _movimentacaoService.EditarMovimentacaoAsync(id, usuarioid, dto);
            return NoContent();
        }

        // ❌ Excluir movimentação
        [HttpDelete("{id}")]
        public async Task<IActionResult> Excluir(Guid id,Guid usuarioid)
        {
            await _movimentacaoService.ExcluirMovimentacaoAsync(id,usuarioid);
            return NoContent();
        }

        // 📊 Resumo (Dashboard)
        [HttpGet("{usuarioId}/resumo")]
        public async Task<IActionResult> Resumo(
            Guid usuarioId,
            [FromQuery] int mes,
            [FromQuery] int ano)
        {
            var resumo = await _movimentacaoService
                .ResumoMovimentacaoAsync(usuarioId, mes, ano);

            return Ok(resumo);
        }
    }
}
